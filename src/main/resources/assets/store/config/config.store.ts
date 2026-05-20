import { map } from 'nanostores';

import type { AiUser } from '@shared/ai-protocol';

export type Config = {
  wsServiceUrl: string;
  instructions: string;
  user: AiUser | null;
};

export const $config = map<Config>({
  wsServiceUrl: '',
  instructions: '',
  user: null,
});
