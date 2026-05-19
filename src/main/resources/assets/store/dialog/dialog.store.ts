import { map } from 'nanostores';

import { getHostApi } from '@/store/host';

export type Dialog = {
  hidden: boolean;
};

export const $dialog = map<Dialog>({
  hidden: true,
});

export const setDialogHidden = (hidden: boolean): void => {
  const isStateChanged = $dialog.get().hidden !== hidden;
  if (isStateChanged) {
    getHostApi().setDialogState(!hidden);
    $dialog.setKey('hidden', hidden);
  }
};

export const toggleDialog = (): void => {
  setDialogHidden(!$dialog.get().hidden);
};
