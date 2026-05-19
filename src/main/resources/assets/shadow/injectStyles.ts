import styles from '../index.css?inline';

const MARKER_ATTR = 'data-ai-content-operator';

export function injectStyles(shadowRoot: ShadowRoot): void {
  if (shadowRoot.querySelector(`style[${MARKER_ATTR}]`) != null) return;

  const style = document.createElement('style');
  style.setAttribute(MARKER_ATTR, 'true');
  style.textContent = styles;
  shadowRoot.prepend(style);
}
