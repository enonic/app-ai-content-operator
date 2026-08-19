import { generateAltText } from '/services/ws/ws';

type GenerateAltTextConfig = {
  socketId: string;
  repo: string;
  contentId: string;
  login: string;
  idProvider: string;
};

export function run(config: GenerateAltTextConfig): void {
  const { socketId, repo, contentId, login, idProvider } = config;
  generateAltText(socketId, repo, contentId, { login, idProvider });
}
