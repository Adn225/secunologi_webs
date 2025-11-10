import {
  parseBody,
  sendJson,
  sendNoContent,
  sendUnexpectedError,
  storeContactSubmission,
  validateContactPayload,
} from '../server/shared.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST,OPTIONS');
    sendJson(res, 405, { error: 'Méthode non autorisée' });
    return;
  }

  try {
    const body = await parseBody(req);
    const result = validateContactPayload(body);
    if (!result.isValid) {
      sendJson(res, 400, { error: 'Validation échouée', details: result.errors });
      return;
    }

    const submission = storeContactSubmission(result.data);
    sendJson(res, 201, {
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons sous 24 heures.',
      data: submission,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    const status = message === 'Payload too large' || message === 'Invalid JSON payload' ? 400 : 500;
    if (status === 500) {
      sendUnexpectedError(res, error);
      return;
    }
    sendJson(res, status, { error: message });
  }
}
