export function scrollToTopPage(
  target?: string | React.RefObject<HTMLElement>,
  behavior: ScrollBehavior = 'smooth'
) {
  const el =
    typeof target === 'string'
      ? document.querySelector<HTMLElement>(target)
      : target && 'current' in target
        ? target.current
        : null;

  if (el) {
    el.scrollTo({ top: 0, behavior });
  } else {
    window.scrollTo({ top: 0, behavior });
  }
}
