import { analyzeAndGenerate } from '/services/ws/ws';

import type { GenerateMessage } from '../../shared/websocket';

type AnalyzeAndGenerateConfig = {
  socketId: string;
  message: string;
};

export function run(config: AnalyzeAndGenerateConfig): void {
  const message = JSON.parse(config.message) as GenerateMessage;
  analyzeAndGenerate(config.socketId, message);
}
