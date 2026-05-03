import { db } from './db.js';
import { requireAuth } from './auth.js';

const MAX_EVENT_BYTES = 50_000;

const getSession = db.prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?');
const listSessions = db.prepare(`
  SELECT s.*, p.title AS profile_title
  FROM sessions s LEFT JOIN profiles p ON p.id = s.profile_id
  WHERE s.user_id = ? ORDER BY s.created_at DESC LIMIT 200
`);
const insertSession = db.prepare(`
  INSERT INTO sessions (user_id, profile_id, kind, title, template, company, role, status)
  VALUES (@user_id, @profile_id, @kind, @title, @template, @company, @role, 'live')
`);
const insertEvent = db.prepare(`
  INSERT INTO session_events (session_id, role, format, text)
  VALUES (?, ?, ?, ?)
`);
const eventsFor = db.prepare('SELECT * FROM session_events WHERE session_id = ? ORDER BY id ASC');
const endSessionStmt = db.prepare(`
  UPDATE sessions
  SET status = 'ended', ended_at = CURRENT_TIMESTAMP,
      duration_s = CAST((julianday(CURRENT_TIMESTAMP) - julianday(created_at)) * 86400 AS INTEGER),
      score = COALESCE(?, score), notes = COALESCE(?, notes)
  WHERE id = ? AND user_id = ?
`);
const deleteSessionStmt = db.prepare('DELETE FROM sessions WHERE id = ? AND user_id = ?');

const VALID_ROLES = new Set(['interviewer', 'you', 'aiyedrix', 'system']);

function serializeSession(row, events) {
  if (!row) return null;
  return {
    id: row.id,
    profileId: row.profile_id,
    profileTitle: row.profile_title || null,
    kind: row.kind,
    title: row.title,
    template: row.template,
    company: row.company,
    role: row.role,
    status: row.status,
    score: row.score,
    notes: row.notes,
    durationSeconds: row.duration_s,
    createdAt: row.created_at,
    endedAt: row.ended_at,
    events: events ? events.map(serializeEvent) : undefined,
  };
}
function serializeEvent(e) {
  return {
    id: e.id,
    role: e.role,
    format: e.format,
    text: e.text,
    createdAt: e.created_at,
  };
}

export function registerSessionRoutes(app) {
  app.get('/api/sessions', requireAuth, (req, res) => {
    const rows = listSessions.all(req.user.id);
    res.json({ sessions: rows.map((r) => serializeSession(r)) });
  });

  app.get('/api/sessions/:id', requireAuth, (req, res) => {
    const row = getSession.get(Number(req.params.id), req.user.id);
    if (!row) return res.status(404).json({ error: 'session not found' });
    const events = eventsFor.all(row.id);
    res.json({ session: serializeSession(row, events) });
  });

  app.post('/api/sessions', requireAuth, (req, res) => {
    const { profileId, kind = 'copilot', title, template, company, role } = req.body || {};
    if (!title || typeof title !== 'string') return res.status(400).json({ error: 'title is required' });

    let resolvedProfileId = null;
    if (profileId != null) {
      const p = db.prepare('SELECT id FROM profiles WHERE id = ? AND user_id = ?').get(Number(profileId), req.user.id);
      if (!p) return res.status(400).json({ error: 'profile not found' });
      resolvedProfileId = p.id;
    }

    const info = insertSession.run({
      user_id: req.user.id,
      profile_id: resolvedProfileId,
      kind: ['copilot', 'mock', 'playground'].includes(kind) ? kind : 'copilot',
      title: title.trim().slice(0, 200),
      template: template || null,
      company: company || null,
      role: role || null,
    });
    const row = getSession.get(info.lastInsertRowid, req.user.id);
    res.status(201).json({ session: serializeSession(row, []) });
  });

  app.post('/api/sessions/:id/events', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (!getSession.get(id, req.user.id)) return res.status(404).json({ error: 'session not found' });

    const { role, format, text } = req.body || {};
    if (!VALID_ROLES.has(role)) return res.status(400).json({ error: 'invalid role' });
    if (typeof text !== 'string' || !text) return res.status(400).json({ error: 'text required' });
    if (Buffer.byteLength(text) > MAX_EVENT_BYTES) return res.status(413).json({ error: 'event too large' });

    const info = insertEvent.run(id, role, format || null, text);
    const ev = db.prepare('SELECT * FROM session_events WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ event: serializeEvent(ev) });
  });

  app.post('/api/sessions/:id/end', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (!getSession.get(id, req.user.id)) return res.status(404).json({ error: 'session not found' });
    const { score, notes } = req.body || {};
    endSessionStmt.run(score ?? null, notes ?? null, id, req.user.id);
    const row = getSession.get(id, req.user.id);
    res.json({ session: serializeSession(row, eventsFor.all(id)) });
  });

  app.delete('/api/sessions/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (!getSession.get(id, req.user.id)) return res.status(404).json({ error: 'session not found' });
    deleteSessionStmt.run(id, req.user.id);
    res.json({ ok: true });
  });
}
