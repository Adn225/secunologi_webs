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
