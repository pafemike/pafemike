import { db } from './db.js';
import { requireAuth } from './auth.js';

const COLUMNS = ['title', 'role', 'company', 'companies', 'resume_text', 'jd_text', 'language'];
const MAX_PROFILES_PER_USER = 25;
const MAX_TEXT_BYTES = 50_000;

function serialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    role: row.role || '',
    company: row.company || '',
    companies: row.companies || '',
    resumeText: row.resume_text || '',
    jdText: row.jd_text || '',
    language: row.language || 'English (US)',
    isDefault: !!row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function readPayload(body) {
  const out = {};
  for (const col of COLUMNS) {
    const camel = col === 'resume_text' ? 'resumeText' : col === 'jd_text' ? 'jdText' : col;
    if (camel in body) {
      const v = body[camel];
      if (v != null && typeof v !== 'string') {
        const err = new Error(`${camel} must be a string`);
        err.status = 400;
        throw err;
      }
      const s = (v ?? '').trim();
      if (Buffer.byteLength(s) > MAX_TEXT_BYTES) {
        const err = new Error(`${camel} exceeds ${MAX_TEXT_BYTES} bytes`);
        err.status = 413;
        throw err;
      }
      out[col] = s;
    }
  }
  return out;
}

const getById = db.prepare('SELECT * FROM profiles WHERE id = ? AND user_id = ?');
const listForUser = db.prepare('SELECT * FROM profiles WHERE user_id = ? ORDER BY is_default DESC, updated_at DESC');
const countForUser = db.prepare('SELECT COUNT(*) AS n FROM profiles WHERE user_id = ?');
const insertProfile = db.prepare(`
  INSERT INTO profiles (user_id, title, role, company, companies, resume_text, jd_text, language, is_default)
  VALUES (@user_id, @title, @role, @company, @companies, @resume_text, @jd_text, @language, @is_default)
`);
const clearDefault = db.prepare('UPDATE profiles SET is_default = 0 WHERE user_id = ?');
const setDefault = db.prepare('UPDATE profiles SET is_default = 1 WHERE id = ? AND user_id = ?');
const deleteProfile = db.prepare('DELETE FROM profiles WHERE id = ? AND user_id = ?');

function makeDefault(userId, profileId) {
  const tx = db.transaction((uid, pid) => {
    clearDefault.run(uid);
    setDefault.run(pid, uid);
  });
  tx(userId, profileId);
}

export function registerProfileRoutes(app) {
  app.get('/api/profiles', requireAuth, (req, res) => {
    const rows = listForUser.all(req.user.id);
    res.json({ profiles: rows.map(serialize) });
  });

  app.get('/api/profiles/:id', requireAuth, (req, res) => {
    const row = getById.get(Number(req.params.id), req.user.id);
    if (!row) return res.status(404).json({ error: 'profile not found' });
    res.json({ profile: serialize(row) });
  });

  app.post('/api/profiles', requireAuth, (req, res) => {
    let payload;
    try { payload = readPayload(req.body || {}); }
    catch (e) { return res.status(e.status || 400).json({ error: e.message }); }

    if (!payload.title) return res.status(400).json({ error: 'title is required' });

    const { n } = countForUser.get(req.user.id);
    if (n >= MAX_PROFILES_PER_USER) {
      return res.status(409).json({ error: `maximum of ${MAX_PROFILES_PER_USER} profiles per account` });
    }

    const isFirst = n === 0;
    const wantsDefault = req.body.isDefault === true || isFirst;

    const tx = db.transaction(() => {
      if (wantsDefault) clearDefault.run(req.user.id);
      const info = insertProfile.run({
        user_id: req.user.id,
        title: payload.title,
        role: payload.role || '',
        company: payload.company || '',
        companies: payload.companies || '',
        resume_text: payload.resume_text || '',
        jd_text: payload.jd_text || '',
        language: payload.language || 'English (US)',
        is_default: wantsDefault ? 1 : 0,
      });
      return getById.get(info.lastInsertRowid, req.user.id);
    });

    res.status(201).json({ profile: serialize(tx()) });
  });

  app.patch('/api/profiles/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const existing = getById.get(id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'profile not found' });

    let payload;
    try { payload = readPayload(req.body || {}); }
    catch (e) { return res.status(e.status || 400).json({ error: e.message }); }

    const fields = Object.keys(payload);
    if (fields.length === 0 && req.body.isDefault !== true) {
      return res.json({ profile: serialize(existing) });
    }

    const tx = db.transaction(() => {
      if (fields.length > 0) {
        const sets = fields.map((c) => `${c} = @${c}`).join(', ');
        db.prepare(`UPDATE profiles SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = @id AND user_id = @user_id`)
          .run({ ...payload, id, user_id: req.user.id });
      }
      if (req.body.isDefault === true) makeDefault(req.user.id, id);
      return getById.get(id, req.user.id);
    });

    res.json({ profile: serialize(tx()) });
  });

  app.post('/api/profiles/:id/default', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (!getById.get(id, req.user.id)) return res.status(404).json({ error: 'profile not found' });
    makeDefault(req.user.id, id);
    res.json({ profile: serialize(getById.get(id, req.user.id)) });
  });

  app.delete('/api/profiles/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const existing = getById.get(id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'profile not found' });

    const tx = db.transaction(() => {
      deleteProfile.run(id, req.user.id);
      // Promote the most-recently-updated remaining profile to default if we just deleted the default.
      if (existing.is_default) {
        const next = db.prepare('SELECT id FROM profiles WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1')
          .get(req.user.id);
        if (next) setDefault.run(next.id, req.user.id);
      }
    });
    tx();
    res.json({ ok: true });
  });
}
