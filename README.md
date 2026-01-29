# Secunologi Webs

Cette application Vite + React fournit l'interface de SecunologieCI. Elle dispose désormais d'une API Node.js minimale pour alimenter le catalogue, le blog et le formulaire de contact.

## Lancer le projet

1. **API (port 5000)**
   ```bash
   npm run server
   ```

   L'API expose :
   - `GET /health` – état du service
   - `GET /api/products` – liste filtrable des produits (`search`, `brand`, `category`, `minPrice`, `maxPrice`, `inStock`, `limit`)
   - `GET /api/products/:id` – détail d'un produit
   - `GET /api/blog-posts` – articles du blog (`limit`)
   - `GET /api/blog-posts/:id` – détail d'un article
   - `POST /api/contact` – enregistre une demande de contact (validation côté serveur)
   - Routes protégées administrateur pour gérer le contenu :
     - `GET /api/admin/products` et `GET /api/admin/products/:id`
     - `GET /api/admin/blog-posts` et `GET /api/admin/blog-posts/:id`
     - `GET /api/admin/promotions` et `GET /api/admin/promotions/:id`
     - Création, mise à jour et suppression via les méthodes POST/PUT/DELETE sur les mêmes segments

   Pour les déploiements Vercel en formule Hobby, toutes ces routes sont servies par une seule fonction serverless (`api/[...route].js`) afin de rester sous la limite des 12 fonctions.

2. **Front-end (port 5173)**
   ```bash
   npm run dev
   ```

   Vite est configuré pour proxyfier automatiquement les appels `/api` vers `http://localhost:5000`.

   Lors d'un déploiement, vous pouvez définir `VITE_API_BASE_URL` pour pointer vers l'origine de votre API (exemple : `https://mon-backend.example.com`).
   Le front tentera d'abord cet URL tel quel, puis réessaiera automatiquement avec le suffixe `/api` si nécessaire avant de revenir sur la valeur relative `/api`.

## Tests

```bash
npm run lint
```

## Ajouter AdminJS au serveur actuel

Le serveur Node de ce projet n'utilise pas Express par défaut (voir `server/index.js`). Pour brancher AdminJS, le plus simple est d'installer Express et de monter AdminJS sur un chemin dédié, tout en réutilisant la logique existante de `handleRequest` pour le reste des routes.

1. **Installer les dépendances nécessaires (avec MongoDB)**

   ```bash
   npm install adminjs @adminjs/express express mongoose @adminjs/mongoose
   ```

   > Remarque : le dépôt contient un stub local `@adminjs/express` dans `vendor/` pour certains déploiements. Pour utiliser AdminJS en local, il faut installer les vrais paquets comme ci‑dessus.

2. **Adapter `server/index.js` pour Express**

   Exemple minimal (à adapter selon vos ressources AdminJS) :

   ```js
   import express from 'express';
   import AdminJS from 'adminjs';
   import AdminJSExpress from '@adminjs/express';
   import AdminJSMongoose from '@adminjs/mongoose';
   import mongoose from 'mongoose';
   import { handleRequest } from './router.js';

   const app = express();

   AdminJS.registerAdapter({
     Database: AdminJSMongoose.Database,
     Resource: AdminJSMongoose.Resource,
   });

   await mongoose.connect(process.env.MONGO_URL ?? 'mongodb://localhost:27017/secunologi');

   const Product = mongoose.model('Product', new mongoose.Schema({
     name: String,
     brand: String,
     category: String,
     price: Number,
     image: String,
     description: String,
     features: [String],
     inStock: Boolean,
   }));

   const BlogPost = mongoose.model('BlogPost', new mongoose.Schema({
     title: String,
     excerpt: String,
     content: String,
     image: String,
     date: String,
     category: String,
   }));

   const admin = new AdminJS({
     rootPath: '/admin',
     resources: [
       { resource: Product },
       { resource: BlogPost },
     ],
   });

   const adminRouter = AdminJSExpress.buildRouter(admin);
   app.use(admin.options.rootPath, adminRouter);

   // Conserver toutes les routes existantes du serveur actuel
   app.all('*', (req, res) => {
     handleRequest(req, res);
   });

   const PORT = Number(process.env.PORT) || 5000;
   app.listen(PORT, () => {
     console.log(`API server listening on port ${PORT}`);
   });
   ```

3. **Définir la variable d'environnement MongoDB**

   ```bash
   export MONGO_URL="mongodb://localhost:27017/secunologi"
   ```

4. **Démarrer le serveur**

   ```bash
   npm run server
   ```

   Puis ouvrir `http://localhost:5000/admin`.
