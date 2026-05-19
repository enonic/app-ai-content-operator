import { t } from 'i18next';

import { GreetingText } from '@/components/dialog/chat/greeting-text/GreetingText';
import { addErrorMessage, addSystemMessage, removeChatMessage } from '@/store/chat';

import { $initialized, $licenseState } from './license.store';

export const setInitialized = (): void => $initialized.set(true);

$licenseState.listen((value) => {
  if (value === 'OK') {
    // ? Short pad so the greeting doesn't pop instantly on warm sessions
    setTimeout(() => {
      removeChatMessage('license-missing');
      setInitialized();
      addSystemMessage({ type: 'context', key: 'greeting', node: <GreetingText /> });
    }, 450);
  } else {
    setInitialized();
    const message =
      value === 'EXPIRED' ? t('text.error.license.expired') : t('text.error.license.missing');
    addErrorMessage(message, 'license-missing');
  }
});
