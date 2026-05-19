const MARKER_ATTR = 'data-ai-content-operator-host';

// ! The drag handler tracks `mousemove` on the host document. Without disabling
// pointer events on host siblings, an iframe (the content editor) swallows the
// pointer mid-drag and the dialog stops following the cursor. Shadow-root styles
// cannot reach the host, so this one rule is injected into the host document.
const HOST_STYLES = `body.ai-content-operator-dragging > *:not(.ai-content-operator) {
  pointer-events: none !important;
}`;

export function injectHostStyles(): void {
  if (document.head.querySelector(`style[${MARKER_ATTR}]`) != null) return;

  const style = document.createElement('style');
  style.setAttribute(MARKER_ATTR, 'true');
  style.textContent = HOST_STYLES;
  document.head.appendChild(style);
}
