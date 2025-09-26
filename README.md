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

## Tests

```bash
npm run lint
```
