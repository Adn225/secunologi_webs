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


## Connexion Supabase

Le front peut désormais enregistrer les demandes du formulaire de contact directement dans Supabase.

1. Copiez les variables d'environnement :

   ```bash
   cp .env.example .env
   ```

2. Vérifiez les variables suivantes dans `.env` :

   - `VITE_SUPABASE_URL=https://hlaxbvzzrvvqsjhqgdnz.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=sb_publishable_nAkKEcUehmasWwkqcc9W5Q_4-IXmogP`
   - `VITE_SUPABASE_CONTACT_TABLE=contact_submissions` (optionnel)

3. Exécutez le script SQL fourni pour créer la table et la policy d'insertion anonyme :

   - Fichier : `supabase/contact_submissions.sql`

   Vous pouvez le coller dans l'éditeur SQL de Supabase puis exécuter.

4. Si vous utilisez un autre nom de table, mettez à jour `VITE_SUPABASE_CONTACT_TABLE`.

Le script crée la table `contact_submissions` avec les colonnes :

   - `name` (text)
   - `email` (text)
   - `phone` (text, nullable)
   - `subject` (text)
   - `message` (text)

Si l'insertion Supabase échoue (table absente/RLS), l'application retombe automatiquement sur l'endpoint API local `/api/contact`.

## Tests

```bash
npm run lint
```
