// ? `:host(.dark)` activates the @enonic/ui dark token cascade inside the
// shadow root. A `.dark` class set on the host page's <html> does not pierce
// the shadow boundary, so the class must be mirrored onto every shadow host.
//
// Content Studio's bootstrap script resolves user preference + OS preference
// into the `<html>.dark` class and advertises it with `<meta name="color-scheme">`.
// When that meta tag is present, the host owns the decision and we follow only
// the class — `prefers-color-scheme` would fight the user's explicit override.
// Without the meta tag (standalone, iframe, future hosts), matchMedia is the
// fallback so the dialog still tracks the OS theme.

const DARK_CLASS = 'dark';
const HOST_MANAGES_THEME = document.querySelector('meta[name="color-scheme"]') != null;

const hosts = new Set<Element>();
let observer: MutationObserver | undefined;
let media: MediaQueryList | undefined;

function isDark(): boolean {
  if (document.documentElement.classList.contains(DARK_CLASS)) return true;
  if (HOST_MANAGES_THEME) return false;
  return media?.matches === true;
}

function applyTheme(): void {
  const dark = isDark();
  for (const host of hosts) {
    host.classList.toggle(DARK_CLASS, dark);
  }
}

function subscribe(): void {
  if (observer == null) {
    observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
  if (!HOST_MANAGES_THEME && media == null) {
    media = window.matchMedia?.('(prefers-color-scheme: dark)');
    media?.addEventListener('change', applyTheme);
  }
}

function unsubscribe(): void {
  observer?.disconnect();
  observer = undefined;
  media?.removeEventListener('change', applyTheme);
  media = undefined;
}

export function registerThemeHost(host: Element): void {
  hosts.add(host);
  subscribe();
  applyTheme();
}

export function unregisterThemeHost(host: Element): void {
  hosts.delete(host);
  if (hosts.size === 0) unsubscribe();
}
