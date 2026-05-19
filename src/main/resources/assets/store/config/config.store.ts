import { map } from 'nanostores';

export type Config = {
  wsServiceUrl: string;
  instructions: string;
};

export const $config = map<Config>({
  wsServiceUrl: '',
  instructions: '',
});
