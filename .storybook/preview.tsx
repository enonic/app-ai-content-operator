import { withThemeByClassName } from '@storybook/addon-themes';
import { themes } from 'storybook/theming';

import { setPluginContext } from '@/store/host/host.utils';

import type { AiPluginApi } from '@shared/ai-protocol';
import type { Preview } from '@storybook/preact-vite';

import { withI18n } from './withI18n';
import './storybook.css';

// Stub the host API so store listeners (e.g. $context.listen → getHostApi())
// don't throw in Storybook. Without this, a single throwing listener breaks
// nanostores' synchronous notify loop and downstream React subscribers never
// re-render.
const noop = (): void => {};
const stubApi: AiPluginApi = {
  on: () => () => {},
  applyValue: () => false,
  setFieldState: noop,
  animateField: noop,
  setContext: noop,
  setDialogState: noop,
  requestSave: noop,
  notify: noop,
};
setPluginContext({
  config: { wsServiceUrl: '', instructions: '' },
  initial: { content: null, schema: null, language: null },
  api: stubApi,
});

const isDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches;

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    docs: { theme: isDark ? themes.dark : themes.light },
  },
  decorators: [
    withI18n,
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: isDark ? 'dark' : 'light',
    }),
  ],
};

export default preview;
