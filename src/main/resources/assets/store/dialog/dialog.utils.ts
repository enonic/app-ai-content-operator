import { resetContext } from '@/store/context';
import { getHostApi } from '@/store/host';

import { $dialog } from './dialog.store';

export const setDialogHidden = (hidden: boolean): void => {
  const isStateChanged = $dialog.get().hidden !== hidden;
  if (isStateChanged) {
    getHostApi().setDialogState(!hidden);
    $dialog.setKey('hidden', hidden);
    if (hidden) {
      resetContext();
    }
  }
};

export const toggleDialog = (): void => {
  setDialogHidden(!$dialog.get().hidden);
};

export const setDialogDragging = (dragging: boolean): void => {
  $dialog.setKey('dragging', dragging);
};
