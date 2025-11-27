import { createServer } from 'http';
import { handleRequest } from './router.js';

const PORT = Number(process.env.PORT) || 5000;

const server = createServer(async (req, res) => {
  await handleRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
