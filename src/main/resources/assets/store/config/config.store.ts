import { map } from 'nanostores';

import type { AiPluginConfig } from '@shared/ai-protocol';

export type Config = {
  wsServiceUrl: string;
  instructions: string;
};

export const $config = map<Config>({
  wsServiceUrl: '',
  instructions: '',
});

const setWsServiceUrl = (wsServiceUrl: string): void =>
  $config.setKey('wsServiceUrl', wsServiceUrl);
const setInstructions = (instructions: string): void =>
  $config.setKey('instructions', instructions);

export const setConfig = (config: AiPluginConfig): void => {
  setWsServiceUrl(config.wsServiceUrl);
  setInstructions(config.instructions);
};
