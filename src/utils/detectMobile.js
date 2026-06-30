export function detectMobile(breakpoint = 768) {
  if (typeof window === "undefined") {
    return false;
  }

  const coarsePointer = window.matchMedia
    ? window.matchMedia("(pointer: coarse)").matches
    : false;

  return window.innerWidth <= breakpoint || coarsePointer;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}
