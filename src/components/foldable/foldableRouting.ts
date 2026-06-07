export function shouldUseFoldableLayout(pathname: string): boolean {
  return !pathname.startsWith("/tradio");
}
