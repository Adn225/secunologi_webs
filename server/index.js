import express from 'express';
import { createAdminRouter } from './admin.js';
import { handleRequest } from './router.js';

const PORT = Number(process.env.PORT) || 5000;

const app = express();
const { router: adminRouter } = createAdminRouter();

app.use(adminRouter);
app.use(async (req, res) => {
  await handleRequest(req, res);
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
