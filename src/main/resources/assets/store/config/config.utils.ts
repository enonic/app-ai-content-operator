import type { AiPluginConfig } from '@shared/ai-protocol';

import { $config } from './config.store';

const setWsServiceUrl = (wsServiceUrl: string): void =>
  $config.setKey('wsServiceUrl', wsServiceUrl);
const setInstructions = (instructions: string): void =>
  $config.setKey('instructions', instructions);

export const setConfig = (config: AiPluginConfig): void => {
  setWsServiceUrl(config.wsServiceUrl);
  setInstructions(config.instructions);
};
