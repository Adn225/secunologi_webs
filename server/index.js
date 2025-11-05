import { createServer } from 'http';
import handler from './app.js';

const PORT = Number(process.env.PORT) || 5000;

const server = createServer((req, res) => {
  handler(req, res).catch((error) => {
    console.error('Unhandled error in request handler:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    if (!res.writableEnded) {
      res.end(JSON.stringify({ error: 'Erreur interne du serveur' }));
    }
  });
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

server.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
