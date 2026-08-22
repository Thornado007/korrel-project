"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------
   Public types
   ------------------------------------------------------------------ */

export interface LightboxTagCategory {
  _id: string;
  title: string;
}

export interface LightboxTag {
  _id: string;
  title: string;
  category?: LightboxTagCategory;
}

export interface LightboxImage {
  /** Good-quality preview URL (e.g. 2400px wide) — loads quickly. */
  src: string;
  /** Original-resolution URL — loaded lazily when the user zooms in. */
  fullSrc?: string;
  alt: string;
  title?: string;
  tags?: LightboxTag[];
}

interface LightboxContextValue {
  open: (image: LightboxImage) => void;
  openGallery: (images: LightboxImage[], startIndex: number) => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error("useLightbox must be used within a LightboxProvider");
  }
  return ctx;
}

/* ------------------------------------------------------------------
   Constants & helpers
   ------------------------------------------------------------------ */

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const ZOOM_STEP_SCALE = 5;

interface PointerData {
  x: number;
  y: number;
}

function distanceBetween(a: PointerData, b: PointerData) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/* ------------------------------------------------------------------
   Provider
   ------------------------------------------------------------------ */

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [gallery, setGallery] = useState<LightboxImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [gestureActive, setGestureActive] = useState(false);
  const [fullResLoaded, setFullResLoaded] = useState(false);

  const image = gallery.length > 0 ? (gallery[currentIndex] ?? null) : null;
  const hasMultiple = gallery.length > 1;
  const hasNext = currentIndex < gallery.length - 1;
  const hasPrev = currentIndex > 0;

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Pointer tracking — works for mouse (single drag) and touch (pinch).
  const pointers = useRef<Map<number, PointerData>>(new Map());
  const gesture = useRef<{
    mode: "none" | "pan" | "pinch";
    lastPan?: PointerData;
    pinchStartDistance?: number;
    pinchStartScale?: number;
  }>({ mode: "none" });

  // Keep a ref in sync with scale so pointer callbacks never close
  // over a stale value.
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  /* ---- open / close / navigate ---- */

  const open = useCallback((next: LightboxImage) => {
    setGallery([next]);
    setCurrentIndex(0);
    setInfoOpen(false);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setFullResLoaded(false);
  }, []);

  const openGallery = useCallback(
    (images: LightboxImage[], startIndex: number) => {
      setGallery(images);
      setCurrentIndex(Math.min(startIndex, images.length - 1));
      setInfoOpen(false);
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      setFullResLoaded(false);
    },
    []
  );

  const close = useCallback(() => {
    setGallery([]);
    setCurrentIndex(0);
    setInfoOpen(false);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setFullResLoaded(false);
    pointers.current.clear();
    gesture.current = { mode: "none" };
    setGestureActive(false);
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setFullResLoaded(false);
    pointers.current.clear();
    gesture.current = { mode: "none" };
    setGestureActive(false);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, gallery.length - 1));
    resetView();
  }, [gallery.length, resetView]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
    resetView();
  }, [resetView]);

  /* ---- full-resolution preloading ---- */

  useEffect(() => {
    if (!image?.fullSrc || fullResLoaded || scale <= 1) return;
    const img = new window.Image();
    img.onload = () => setFullResLoaded(true);
    img.src = image.fullSrc;
  }, [image?.fullSrc, fullResLoaded, scale]);

  const displaySrc =
    fullResLoaded && image?.fullSrc ? image.fullSrc : image?.src;

  /* ---- clamping helper ---- */

  const clampTranslate = useCallback(
    (next: { x: number; y: number }, currentScale: number) => {
      const container = stageRef.current;
      const img = imgRef.current;
      if (!container || !img) return next;

      const containerRect = container.getBoundingClientRect();
      const scaledWidth = img.clientWidth * currentScale;
      const scaledHeight = img.clientHeight * currentScale;

      const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
      const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    []
  );

  /* ---- pointer events ---- */

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore if unsupported */
      }

      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      setGestureActive(true);

      if (pointers.current.size === 2) {
        const [a, b] = Array.from(pointers.current.values());
        gesture.current = {
          mode: "pinch",
          pinchStartDistance: distanceBetween(a, b),
          pinchStartScale: scaleRef.current,
        };
      } else if (pointers.current.size === 1) {
        gesture.current = {
          mode: "pan",
          lastPan: { x: e.clientX, y: e.clientY },
        };
      }
    },
    []
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (gesture.current.mode === "pinch" && pointers.current.size === 2) {
        const [a, b] = Array.from(pointers.current.values());
        const dist = distanceBetween(a, b);
        const { pinchStartDistance = dist, pinchStartScale = 1 } =
          gesture.current;
        const nextScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, pinchStartScale * (dist / pinchStartDistance))
        );
        setScale(nextScale);
        setTranslate((t) => clampTranslate(t, nextScale));
        return;
      }

      if (gesture.current.mode === "pan" && scaleRef.current > 1) {
        const last = gesture.current.lastPan ?? {
          x: e.clientX,
          y: e.clientY,
        };
        const dx = e.clientX - last.x;
        const dy = e.clientY - last.y;
        gesture.current.lastPan = { x: e.clientX, y: e.clientY };
        setTranslate((t) =>
          clampTranslate({ x: t.x + dx, y: t.y + dy }, scaleRef.current)
        );
      }
    },
    [clampTranslate]
  );

  const endPointer = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size === 0) {
        gesture.current = { mode: "none" };
        setGestureActive(false);
      } else if (pointers.current.size === 1) {
        const [remaining] = Array.from(pointers.current.values());
        gesture.current = { mode: "pan", lastPan: remaining };
      }
    },
    []
  );

  /* ---- double-tap / double-click zoom toggle ---- */

  const lastTapRef = useRef(0);
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setScale((s) => (s > 1 ? 1 : ZOOM_STEP_SCALE));
      setTranslate({ x: 0, y: 0 });
    }
    lastTapRef.current = now;
  }, []);

  /* ---- imperative wheel zoom (non-passive, so preventDefault works) ---- */

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !image) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0015;
      setScale((s) => {
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + s * delta));
        setTranslate((t) => clampTranslate(t, next));
        return next;
      });
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [image, clampTranslate]);

  /* ---- keyboard + body-scroll lock ---- */

  useEffect(() => {
    if (!image) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" && hasNext) goNext();
      if (e.key === "ArrowLeft" && hasPrev) goPrev();
    };
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    const scrollY = window.scrollY;
    const { overflow, position, top, left, right } = document.body.style;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.left = left;
      document.body.style.right = right;
      window.scrollTo(0, scrollY);
    };
  }, [image, close, hasNext, hasPrev, goNext, goPrev]);

  /* ---- separate author tag from other tags ---- */

  const authorTag = useMemo(() => {
    if (!image?.tags?.length) return null;
    return (
      image.tags.find(
        (t) => t.category?.title?.toLowerCase() === "author"
      ) ?? null
    );
  }, [image?.tags]);

  const detailTags = useMemo(() => {
    if (!image?.tags?.length) return [];
    return image.tags.filter(
      (t) => t.category?.title?.toLowerCase() !== "author"
    );
  }, [image?.tags]);

  const groupedDetailTags = useMemo(() => {
    if (!detailTags.length) return [];
    const groups = new Map<string, { label: string; tags: LightboxTag[] }>();
    for (const tag of detailTags) {
      const key = tag.category?._id ?? "uncategorized";
      const label = tag.category?.title ?? "Other";
      if (!groups.has(key)) groups.set(key, { label, tags: [] });
      groups.get(key)!.tags.push(tag);
    }
    return Array.from(groups.values());
  }, [detailTags]);

  const contextValue = useMemo(
    () => ({ open, openGallery }),
    [open, openGallery]
  );

  /* ---- render ---- */

  return (
    <LightboxContext.Provider value={contextValue}>
      {children}

      {image && (
        <div
          className="lightbox-overlay fixed inset-0 z-[9999] flex flex-col bg-black"
          role="dialog"
          aria-modal="true"
          aria-label={image.alt || image.title || "Image preview"}
          onClick={close}
        >
          {/* ---- Toolbar ---- */}
          <div
            className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm text-white/80">
                {image.title ?? ""}
              </span>
              {authorTag && (
                <span className="truncate text-xs text-white/50">
                  {authorTag.title}
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {/* More info toggle */}
              {groupedDetailTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInfoOpen((v) => !v)}
                  aria-pressed={infoOpen}
                  aria-label="Show image details"
                  className={`flex h-11 items-center justify-center rounded-full px-3 text-xs transition-colors ${
                    infoOpen
                      ? "bg-white text-black"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {infoOpen ? "Less info" : "More info"}
                </button>
              )}

              {/* Zoom toggle */}
              <button
                type="button"
                onClick={() => {
                  setScale((s) => (s > 1 ? 1 : ZOOM_STEP_SCALE));
                  setTranslate({ x: 0, y: 0 });
                }}
                aria-pressed={scale > 1}
                aria-label={scale > 1 ? "Reset zoom" : "Zoom in"}
                title={scale > 1 ? "Reset zoom" : "Zoom"}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  scale > 1
                    ? "bg-white text-black"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8.5 6.2v4.6M6.2 8.5h4.6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 13L17 17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Close */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white focus:text-white focus:outline-none"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 5L15 15M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* ---- Image stage (pan & pinch-to-zoom) ---- */}
          <div
            ref={stageRef}
            className="relative flex flex-1 touch-none items-center justify-center overflow-hidden px-2 pb-2 select-none sm:px-10 sm:pb-10"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => {
              endPointer(e);
              handleTap();
            }}
            onPointerCancel={endPointer}
            onPointerLeave={endPointer}
          >
            {/* Previous button */}
            {hasMultiple && hasPrev && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white sm:left-4 sm:h-12 sm:w-12"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 4L6 10l6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* Next button */}
            {hasMultiple && hasNext && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white sm:right-4 sm:h-12 sm:w-12"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M8 4l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={displaySrc}
              alt={image.alt}
              draggable={false}
              className={`max-h-full max-w-full object-contain ${
                scale > 1 ? "cursor-grab active:cursor-grabbing" : ""
              }`}
              style={{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                transition: gestureActive
                  ? "none"
                  : "transform 150ms ease-out",
                willChange: "transform",
              }}
            />

            {/* Full-resolution loading indicator */}
            {scale > 1 && (
              <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs backdrop-blur-sm sm:bottom-6 sm:right-6">
                {fullResLoaded ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    <span className="text-white/80">Full resolution</span>
                  </>
                ) : (
                  <>
                    <span className="animate-res-pulse h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-white/80">Loading…</span>
                  </>
                )}
              </div>
            )}

            {/* Image counter */}
            {hasMultiple && (
              <span className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs tabular-nums text-white/70 backdrop-blur-sm sm:bottom-6">
                {currentIndex + 1} / {gallery.length}
              </span>
            )}
          </div>

          {/* ---- Info panel (expandable) ---- */}
          {infoOpen && groupedDetailTags.length > 0 && (
            <div
              className="relative z-10 max-h-[40vh] shrink-0 overflow-y-auto border-t border-white/10 bg-black/90 p-5 sm:px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-2.5">
                {groupedDetailTags.map((group) => (
                  <div
                    key={group.label}
                    className="flex flex-wrap items-baseline gap-x-1.5 text-sm"
                  >
                    <span className="font-medium text-white">
                      {group.label}:
                    </span>
                    <span className="text-white/70">
                      {group.tags.map((t) => t.title).join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </LightboxContext.Provider>
  );
}
