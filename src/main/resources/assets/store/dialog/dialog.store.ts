import { map } from 'nanostores';

export type Dialog = {
  hidden: boolean;
  dragging: boolean;
};

export const $dialog = map<Dialog>({
  hidden: true,
  dragging: false,
});
