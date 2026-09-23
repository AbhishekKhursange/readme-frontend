import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";

// Front cover: full-bleed cover art with title/author on a plate at the
// bottom, shown alone (not paired with a facing page) — matches how a real
// book's cover isn't "spread" with anything else.
const CoverPage = forwardRef(({ coverImageUrl, title, author }, ref) => (
  <div className="flip-page flip-cover" ref={ref}>
    {coverImageUrl && <img src={coverImageUrl} alt={title} className="flip-cover-image" />}
    <div className="flip-cover-plate">
      <h5 className="flip-cover-title">{title}</h5>
      {author && <p className="flip-cover-author">By {author}</p>}
    </div>
  </div>
));

// An image-only page — no text, no page number, matching Gemini's split.
const ImagePage = forwardRef(({ imageUrl, alt }, ref) => (
  <div className="flip-page" ref={ref}>
    <div className="flip-page-image flip-page-image-full">
      <img src={imageUrl} alt={alt} loading="lazy" />
    </div>
  </div>
));

// A text-only page — running author header top-right, page number
// bottom-right, a down-arrow button that scrolls three lines at a time,
// only ever shown on pages that actually have text. The scrollbar itself
// stays hidden until the reader actually scrolls (see handleScroll below),
// then fades back out shortly after they stop.
const LINE_HEIGHT_PX = 30; // must match .story-text.drop-cap's line-height
const SCROLL_LINES = 3;

const TextPage = forwardRef(({ text, author, pageNumber }, ref) => {
  const scrollRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const handleScroll = () => {
    setIsScrolling(true);
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 800);
  };

  const handleArrowClick = () => {
    scrollRef.current?.scrollBy({ top: LINE_HEIGHT_PX * SCROLL_LINES, behavior: "smooth" });
  };

  return (
    <div className="flip-page" ref={ref}>
      {author && <span className="flip-page-header">{author.toUpperCase()}</span>}
      <div
        className={`flip-page-text flip-page-text-full${isScrolling ? " is-scrolling" : ""}`}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <p className="story-text drop-cap">{text}</p>
      </div>
      <button
        type="button"
        className="flip-scroll-arrow"
        aria-label="Scroll down three lines"
        onClick={(e) => {
          e.stopPropagation();
          handleArrowClick();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4v14M6 13l6 6 6-6"
            stroke="#5f6368"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {pageNumber != null && <span className="flip-page-number">{pageNumber}</span>}
    </div>
  );
});

// Build the flat list of flip-book leaves: cover (if provided), then one
// image leaf + one text leaf per story page (only the leaves that have
// content are created — a page with no text produces no text leaf at all).
function buildLeaves(pages, coverImageUrl, title, author) {
  const leaves = [];
  const hasCover = Boolean(coverImageUrl || title);

  if (hasCover) {
    leaves.push({ kind: "cover", key: "cover" });
  }

  let textPageCounter = 0;
  pages.forEach((page, idx) => {
    if (page.imageUrl) {
      leaves.push({ kind: "image", key: `img-${idx}`, imageUrl: page.imageUrl });
    }
    if (page.text && page.text.trim().length > 0) {
      textPageCounter += 1;
      leaves.push({ kind: "text", key: `text-${idx}`, text: page.text, pageNumber: textPageCounter });
    }
  });

  // react-pageflip pairs everything after a solo cover into spreads of two —
  // an odd count leaves one side of the last spread with no page at all,
  // showing the site background through instead of paper.
  const pairableCount = leaves.length - (hasCover ? 1 : 0);
  if (pairableCount % 2 !== 0) {
    leaves.push({ kind: "text", key: "end", text: "The End", pageNumber: null });
  }

  return leaves;
}

// Max number of stacked "sheet" lines to ever show, however many pages
// have actually been turned — matches "after the 4th page, keep it at 3-4".
const MAX_STACK_LINES = 3;

export default function PageFlipViewer({ pages, coverImageUrl, title, author }) {
  const [dimensions, setDimensions] = useState({ width: 380, height: 520 });
  const [leftAnchor, setLeftAnchor] = useState(320);
  const [spreadLeftAnchor, setSpreadLeftAnchor] = useState(220);
  const [flipCount, setFlipCount] = useState(0);
  const hasCover = Boolean(coverImageUrl || title);
  const [onCover, setOnCover] = useState(hasCover);
  const bookRef = useRef(null);

  useEffect(() => {
    const computeSize = () => {
      // Fit within the viewport (minus navbar + back-link + padding) so the
      // book never forces the page to scroll — a fixed compact size instead
      // of stretching to fill available space.
      const availableHeight = window.innerHeight - 190;
      const height = Math.max(360, Math.min(560, availableHeight));
      const width = Math.round(height * 0.72) + 19; // ~0.5cm wider
      setDimensions({ width, height });

      // Where the book's visible left edge should sit, as a proportion of
      // the viewport (not a fixed px) so it stays roughly in the same
      // relative spot — clear of the background moon — across window
      // sizes. Tune this fraction directly if it drifts on your screen.
      setLeftAnchor(Math.round(window.innerWidth * 0.41));

      // The open two-page spread sits further left than the cover — its
      // own independent anchor fraction, not derived from leftAnchor, so
      // the two can be tuned separately without one affecting the other.
      setSpreadLeftAnchor(Math.round(window.innerWidth * 0.285));
    };

    computeSize();
    window.addEventListener("resize", computeSize);
    return () => window.removeEventListener("resize", computeSize);
  }, []);

  const leaves = useMemo(
    () => buildLeaves(pages, coverImageUrl, title, author),
    [pages, coverImageUrl, title, author]
  );

  // react-pageflip's onFlip reports the raw leaf index (0 = solo cover,
  // then pairs: 1&2 = spread 1, 3&4 = spread 2, ...). Converting that
  // straight to a spread number each time — rather than incrementing a
  // counter — means there's no drift possible in either direction, and it
  // works correctly however far you jump (a click always moves by one
  // spread, but this also handles a future "jump to page" control safely).
  const handleFlip = (e) => {
    const newIndex = e.data;
    const spreadIndex = hasCover ? (newIndex === 0 ? 0 : Math.ceil(newIndex / 2)) : Math.ceil((newIndex + 1) / 2);
    setFlipCount(spreadIndex);
    setOnCover(hasCover && newIndex === 0);
  };

  // How many spreads the whole book has, so the right stack can react to
  // true distance from the end, not just how many turns you've made.
  const totalSpreads = Math.ceil((leaves.length - (hasCover ? 1 : 0)) / 2);

  // --- Stack counts ---
  // Left: grows with each turn, capped at MAX_STACK_LINES (3) — flipCount
  // is already the true current spread number, so this needs no extra math.
  //
  // Right: fixed at 2 on the cover. Once open, it stays capped at 3 for
  // most of the book, and only changes right at the tail — the k-th-to-last
  // spread (k = spreads remaining, counting the current one) maps to:
  //   k >= 3  -> 3
  //   k == 2  -> 2
  //   k <= 1  -> 0   (the final spread — nothing left behind it)
  const COVER_STACK_LINES = 2;

  const leftStackCount = Math.min(MAX_STACK_LINES, flipCount);

  const spreadsFromEnd = totalSpreads - flipCount + 1;
  const rightStackCount = onCover
    ? COVER_STACK_LINES
    : spreadsFromEnd >= 3
      ? 3
      : spreadsFromEnd === 2
        ? 2
        : 0;

  // react-pageflip reserves full double-page width internally whenever

  // showCover is on, even for the lone cover — it renders that cover in
  // the *right half* of that reserved space (visible content starts at
  // shellLeft + width, not shellLeft). So to land the visible cover's left
  // edge exactly at `leftAnchor`, the shell itself must sit `width` to the
  // left of that. Once a real spread is open, both halves are filled with
  // real content (no such offset), so the shell's own left edge IS the
  // visible left edge — and it goes straight to `spreadLeftAnchor`.
  const shellMarginLeft = onCover ? leftAnchor - dimensions.width : spreadLeftAnchor;

  return (
    <div style={{ width: "100vw", position: "relative", left: "50%", transform: "translateX(-50%)" }}>
      {/* flip-book-shell hosts the page-stack + spine-shadow overlays,
          which are purely decorative and sit on top of the book. */}
      <div
        className="flip-book-shell"
        style={{ marginLeft: shellMarginLeft, transition: "margin-left 0.4s ease" }}
      >
        {leftStackCount > 0 &&
          Array.from({ length: leftStackCount }).map((_, i) => (
            <div
              key={i}
              className="page-stack-line page-stack-line-left"
              // Explicit z-index per layer (not left to DOM order + a shared
              // value) — higher i sits further out, so it must paint further
              // back. Without this, the browser falls back to DOM order for
              // same-z-index siblings, which can paint the wrong layer on
              // top and blur the seam between sheets.
              style={{ left: -4 - i * 4, zIndex: -1 - i }}
            />
          ))}

        {rightStackCount > 0 &&
          Array.from({ length: rightStackCount }).map((_, i) => (
            <div
              key={i}
              className="page-stack-line page-stack-line-right"
              style={{ right: -4 - i * 4, zIndex: -1 - i }}
            />
          ))}

        <HTMLFlipBook
          ref={bookRef}
          width={dimensions.width}
          height={dimensions.height}
          size="fixed"
          minWidth={280}
          maxWidth={540}
          minHeight={360}
          maxHeight={560}
          maxShadowOpacity={0.5}
          showCover={Boolean(coverImageUrl || title)}
          usePortrait={false}
          mobileScrollSupport={true}
          className="story-flipbook"
          onFlip={handleFlip}
        >
          {leaves.map((leaf) => {
            if (leaf.kind === "cover") {
              return <CoverPage key={leaf.key} coverImageUrl={coverImageUrl} title={title} author={author} />;
            }
            if (leaf.kind === "image") {
              return <ImagePage key={leaf.key} imageUrl={leaf.imageUrl} alt={title} />;
            }
            return <TextPage key={leaf.key} text={leaf.text} author={author} pageNumber={leaf.pageNumber} />;
          })}
        </HTMLFlipBook>
        {/* Only a real two-page spread has a center seam — a solo cover
            doesn't, and rendering this against the cover's unusually-sized
            (double-width-internally) shell was producing a stray shadow
            line in the wrong place. Two one-directional gradients (one per
            page, meeting at the spine) instead of one symmetric gradient —
            matches how Gemini's own book viewer builds this shadow. */}
        {!onCover && (
          <>
            <div className="flip-spine-shadow flip-spine-shadow-left" aria-hidden="true" />
            <div className="flip-spine-shadow flip-spine-shadow-right" aria-hidden="true" />
          </>
        )}
      </div>
    </div>
  );
}