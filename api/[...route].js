import { handleRequest } from '../server/router.js';

export default async function handler(req, res) {
  await handleRequest(req, res);
}
