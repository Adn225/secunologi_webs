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

## Déploiement de l'API sur Vercel

1. **Préparer le projet**
   - L'API est encapsulée dans `server/app.js` et exposée localement via `server/index.js`.
   - Une fonction serverless compatible Vercel est disponible dans `api/index.js`; elle réutilise exactement les mêmes règles métier que le serveur local.

2. **Déploiement avec l'interface Vercel**
   - Poussez votre dépôt sur GitHub/GitLab/Bitbucket.
   - Créez un nouveau projet Vercel en pointant sur ce dépôt et laissez les réglages par défaut (`npm install`, puis `npm run build`).
   - Vercel détecte automatiquement le dossier `api/` et publie l'API en Node.js 18 grâce à la configuration `runtime` exportée.

3. **Déploiement avec la CLI**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

4. **Consommation**
   - Les routes précédemment listées sont disponibles depuis `https://<votre-projet>.vercel.app/api/...`.
   - Pour votre front, définissez `VITE_API_BASE_URL` sur l'URL de production si vous n'utilisez pas le proxy `/api`.
