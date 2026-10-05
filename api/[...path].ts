import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const { default: app } = await import('../artifacts/api-server/src/app.js');
  return app(req, res);
}
