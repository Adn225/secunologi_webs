import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSMongoose from '@adminjs/mongoose';
import mongoose from 'mongoose';
import { handleRequest } from './router.js';

const PORT = Number(process.env.PORT) || 5000;

const app = express();

AdminJS.registerAdapter({
  Database: AdminJSMongoose.Database,
  Resource: AdminJSMongoose.Resource,
});

const Product = mongoose.model(
  'Product',
  new mongoose.Schema({
    name: String,
    brand: String,
    category: String,
    price: Number,
    image: String,
    description: String,
    features: [String],
    inStock: Boolean,
  }),
);

const BlogPost = mongoose.model(
  'BlogPost',
  new mongoose.Schema({
    title: String,
    excerpt: String,
    content: String,
    image: String,
    date: String,
    category: String,
  }),
);

const startServer = async () => {
  await mongoose.connect(process.env.MONGO_URL ?? 'mongodb://localhost:27017/secunologi');

  const admin = new AdminJS({
    rootPath: '/admin',
    resources: [{ resource: Product }, { resource: BlogPost }],
  });

  const adminRouter = AdminJSExpress.buildRouter(admin);
  app.use(admin.options.rootPath, adminRouter);

  app.all('*', async (req, res) => {
    await handleRequest(req, res);
  });

  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start API server:', error);
  process.exitCode = 1;
});
