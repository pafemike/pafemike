import { db } from './db.js';
import { requireAuth } from './auth.js';

export const MODEL_FOR = {
  haiku:  'claude-haiku-4-5',
  sonnet: 'claude-sonnet-4-6',
  opus:   'claude-opus-4-7',
};
const VALID_PREFS = new Set(Object.keys(MODEL_FOR));

export function modelIdForUser(user) {
  return MODEL_FOR[user.model_preference] || MODEL_FOR.sonnet;
}

export function registerSettingsRoutes(app) {
  app.get('/api/settings', requireAuth, (req, res) => {
    res.json({
      modelPreference: req.user.model_preference || 'sonnet',
      availableModels: Object.entries(MODEL_FOR).map(([k, id]) => ({
        key: k,
        modelId: id,
        label: { haiku: 'Haiku 4.5 — fastest, cheapest', sonnet: 'Sonnet 4.6 — balanced', opus: 'Opus 4.7 — most capable' }[k],
      })),
    });
  });

  app.patch('/api/settings', requireAuth, (req, res) => {
    const { modelPreference } = req.body || {};
    if (!VALID_PREFS.has(modelPreference)) {
      return res.status(400).json({ error: 'modelPreference must be one of: ' + [...VALID_PREFS].join(', ') });
    }
    db.prepare('UPDATE users SET model_preference = ? WHERE id = ?').run(modelPreference, req.user.id);
    res.json({ modelPreference });
  });
}
