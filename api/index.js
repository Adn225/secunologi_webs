import handler from '../server/app.js';

export const config = {
  runtime: 'nodejs18.x',
};

export default async function vercelHandler(req, res) {
  await handler(req, res);
}
