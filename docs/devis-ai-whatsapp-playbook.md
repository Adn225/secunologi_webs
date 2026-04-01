# Plan d'implémentation — IA de devis (Contact → WhatsApp → validation → envoi client)

Ce guide décrit **comment rendre opérationnel** le flux demandé:

1. Le client soumet le formulaire `/contact` avec le sujet **Demande de devis**.
2. L'IA lit le champ **message**, identifie les produits et quantités, et construit un devis avec les prix du site.
3. Le brouillon de devis est envoyé sur WhatsApp interne (**+225 05 963 225 80**) pour validation humaine.
4. Après validation, le devis est envoyé au client sur ses canaux (email + WhatsApp).

---

## 1) État actuel du projet (points d'ancrage)

- Frontend: la page `src/pages/Contact.tsx` envoie le formulaire via `submitContact(formData)` et propose déjà l'option `subject="devis"` dans la liste des sujets.
- Backend: la route `POST /api/contact` est gérée dans `server/router.js`.
- Persistance contact: la soumission est validée et stockée via les utilitaires de `server/shared.js`.
- Catalogue/prix: les données produit sont exposées sur `GET /api/products`.

> Ces éléments permettent d'ajouter l'IA sans refaire tout le formulaire.

---

## 2) Architecture cible (recommandée)

Ajouter une mini-orchestration côté backend:

- **Étape A — Ingestion**: réception du formulaire contact.
- **Étape B — Extraction IA**: parser le message en `quote_intent` (produits, quantités, contraintes).
- **Étape C — Chiffrage**: matcher les produits du catalogue + calcul total.
- **Étape D — Validation interne**: envoyer le brouillon via WhatsApp interne.
- **Étape E — Confirmation**: un humain valide/ajuste.
- **Étape F — Diffusion client**: envoi du devis final au client via email + WhatsApp.

### Services à brancher

- **LLM**: OpenAI (analyse du message + structuration JSON).
- **WhatsApp API**: Twilio WhatsApp Business API ou Meta WhatsApp Cloud API.
- **Email**: Resend, SendGrid ou SMTP transactionnel.
- **Storage**: table SQL/Supabase `quotes`, `quote_items`, `quote_events`.

---

## 3) Modèle de données minimal

Créer des entités:

- `quotes`
  - `id`, `contact_submission_id`, `status` (`draft|pending_validation|approved|sent|rejected`)
  - `currency`, `subtotal`, `tax`, `total`
  - `client_name`, `client_email`, `client_phone`
  - `validation_channel_message_id`, `approved_by`, `approved_at`
  - `created_at`, `updated_at`
- `quote_items`
  - `id`, `quote_id`, `product_id`, `label`, `unit_price`, `qty`, `line_total`, `source_confidence`
- `quote_events`
  - `id`, `quote_id`, `event_type`, `payload_json`, `created_at`

---

## 4) Détails backend à implémenter

## 4.1 Détection du sujet "Demande de devis"

Dans `POST /api/contact`:

- Si `subject !== "devis"`: conserver le flux actuel.
- Si `subject === "devis"`: déclencher le pipeline IA asynchrone.

## 4.2 Job asynchrone (important)

Ne pas tout faire dans la requête HTTP du formulaire. Utiliser:

- BullMQ/Redis, ou
- un worker simple (queue DB + cron/worker process).

Objectif: éviter timeout, retentatives propres, traçabilité.

## 4.3 Extraction structurée IA

Prompt système orienté extraction (pas marketing), sortie JSON stricte:

```json
{
  "items": [
    {"product_hint": "camera hikvision", "qty": 4, "notes": "vision nocturne"}
  ],
  "constraints": {"budget_max": null, "urgency": "normal"},
  "confidence": 0.0,
  "missing_fields": ["adresse installation"]
}
```

Règles:

- Refuser l'invention de produits absents du catalogue.
- Si ambiguïté forte: statut `needs_clarification` + message interne.

## 4.4 Matching catalogue + pricing

Algorithme recommandé:

1. Normalisation texte (minuscules, accents, stopwords FR).
2. Recherche lexicale (nom, marque, catégorie).
3. Similarité sémantique (embedding) si nécessaire.
4. Seuil de confiance minimum (ex. 0.72).
5. Fallback humain si score faible.

Puis calcul:

- `line_total = unit_price * qty`
- `subtotal = somme(line_total)`
- appliquer TVA/remise selon règles métier.

## 4.5 Génération PDF devis

Produire un PDF versionnable:

- Numéro devis (`DEV-YYYY-XXXX`)
- Conditions commerciales
- Validité (ex: 15 jours)
- Signature/cachet optionnels

Librairies possibles: `pdf-lib`, `puppeteer`, ou moteur template HTML→PDF.

## 4.6 Validation sur WhatsApp interne

Envoyer le brouillon à `+2250596322580` avec:

- résumé client
- lignes devis
- total
- actions: `APPROUVER <quote_id>` / `REJETER <quote_id>` / `EDITER <quote_id>`

Implémenter un webhook entrant WhatsApp pour recevoir la réponse de validation.

## 4.7 Envoi client multi-canal après validation

Après `APPROUVER`:

- email client: sujet + PDF + résumé.
- WhatsApp client: message court + lien sécurisé PDF.
- journaliser l'état `sent` et les IDs de messages.

---

## 5) Sécurité, conformité, garde-fous

- Secrets en variables d'environnement (jamais en dur).
- Signature des webhooks (WhatsApp/email).
- Limites anti-abus (rate limiting + captcha sur contact).
- Journal d'audit des décisions IA/humaines.
- Politique de conservation des données (RGPD local/secteur).
- Validation humaine obligatoire au lancement (désactiver auto-envoi direct au début).

---

## 6) Variables d'environnement à prévoir

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
INTERNAL_VALIDATION_WHATSAPP=whatsapp:+2250596322580
EMAIL_PROVIDER=resend
EMAIL_FROM=devis@securologieci.com
RESEND_API_KEY=
APP_BASE_URL=https://secunologie.com
```

---

## 7) Plan de mise en production par phases

### Phase 1 — MVP contrôlé (1 à 2 semaines)

- Détection `subject=devis`
- Extraction IA + devis brouillon
- Envoi WhatsApp interne uniquement
- Validation manuelle, pas encore d'envoi automatique client

### Phase 2 — Diffusion client (1 semaine)

- Webhook validation interne
- Envoi email + WhatsApp client
- PDF systématique

### Phase 3 — Fiabilisation (continu)

- dashboard de suivi des devis
- scoring qualité d'extraction
- tests automatiques et alerting erreurs

---

## 8) Checklist de tests opérationnels

- Cas nominal: message clair avec 2–3 produits.
- Cas ambigu: produit non trouvé → fallback humain.
- Cas canal manquant: client sans WhatsApp → email seul.
- Cas panne API WhatsApp: retry + alerte admin.
- Non-régression: sujet autre que devis inchangé.

---

## 9) Recommandations business immédiates

- Standardiser le champ message avec un placeholder guidé:
  - type d'installation
  - nombre d'équipements
  - lieu
  - budget estimatif
- Ajouter une case de consentement de contact WhatsApp.
- Ajouter une mention: "Le devis est confirmé après validation interne".

---

## 10) Résultat attendu

À la fin, vous obtenez un flux robuste:

- **Automatique** pour construire rapidement le devis.
- **Sécurisé** grâce à la validation humaine.
- **Omnicanal** pour livrer au client sur email + WhatsApp.
