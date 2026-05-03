import { db } from './db.js';
import { requireAuth } from './auth.js';
import { QUESTIONS } from './questions-seed.js';

// Idempotent seed — INSERT OR IGNORE on the unique slug.
const insertQ = db.prepare(`
  INSERT OR IGNORE INTO questions
    (slug, title, category, company, level, framework, tags, answer_md, speaker_note, popularity)
  VALUES
    (@slug, @title, @category, @company, @level, @framework, @tags, @answer_md, @speaker_note, @popularity)
`);
const seedTx = db.transaction((rows) => { for (const r of rows) insertQ.run(r); });
seedTx(QUESTIONS.map((q) => ({
  slug: q.slug,
  title: q.title,
  category: q.category,
  company: q.company || null,
  level: q.level || null,
  framework: q.framework || null,
  tags: q.tags || null,
  answer_md: q.answer_md,
  speaker_note: q.speaker_note || null,
  popularity: q.popularity || 0,
})));

function serialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    company: row.company,
    level: row.level,
    framework: row.framework,
    tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    answerMd: row.answer_md,
    speakerNote: row.speaker_note,
    popularity: row.popularity,
  };
}

function summary(row) {
  // Exclude the full markdown answer for list views — clients only need the metadata + a teaser.
  const teaser = row.answer_md ? row.answer_md.replace(/[#*`_>-]/g, '').slice(0, 160).replace(/\s+/g, ' ').trim() + '…' : '';
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    company: row.company,
    level: row.level,
    framework: row.framework,
    tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    teaser,
  };
}

export function registerQuestionRoutes(app) {
  // Public list — no auth needed; the question bank is shareable.
  app.get('/api/questions', (req, res) => {
    const { category, q, company } = req.query;
    let sql = 'SELECT * FROM questions';
    const where = [];
    const params = [];
    if (category && category !== 'all') { where.push('category = ?'); params.push(category); }
    if (company) { where.push('(company = ? OR ? IN (SELECT value FROM (SELECT company AS value)))'); params.push(company, company); }
    if (q) { where.push('(LOWER(title) LIKE ? OR LOWER(tags) LIKE ?)'); const like = `%${String(q).toLowerCase()}%`; params.push(like, like); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY popularity DESC, id ASC LIMIT 500';
    const rows = db.prepare(sql).all(...params);
    res.json({ questions: rows.map(summary), total: rows.length });
  });

  app.get('/api/questions/:idOrSlug', (req, res) => {
    const key = req.params.idOrSlug;
    const row = /^\d+$/.test(key)
      ? db.prepare('SELECT * FROM questions WHERE id = ?').get(Number(key))
      : db.prepare('SELECT * FROM questions WHERE slug = ?').get(key);
    if (!row) return res.status(404).json({ error: 'question not found' });
    res.json({ question: serialize(row) });
  });

  // Increment popularity (free; analytics-style — no auth needed but rate-limit in prod).
  app.post('/api/questions/:id/view', (req, res) => {
    const id = Number(req.params.id);
    db.prepare('UPDATE questions SET popularity = popularity + 1 WHERE id = ?').run(id);
    res.json({ ok: true });
  });
}
