interface DeferredSectionBounds {
  bottom: number;
  top: number;
}

export function shouldMountDeferredSection(
  bounds: DeferredSectionBounds,
  viewportHeight: number,
): boolean {
  return bounds.top <= viewportHeight || bounds.bottom < 0;
}
