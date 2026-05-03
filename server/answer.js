import Anthropic from '@anthropic-ai/sdk';
import { db } from './db.js';
import { requireAuth } from './auth.js';
import { modelIdForUser } from './settings.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.warn('WARN: ANTHROPIC_API_KEY not set — /api/answer will return 503 until you add it to .env');
}

const client = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

const SYSTEM_PROMPT = `You are Aiyedrix, a real-time AI interview copilot. You sit silently beside the candidate and produce concise, structured, ready-to-speak answers to the interviewer's questions.

Core rules:
- Write in the FIRST PERSON, as if the candidate is speaking. Never refer to "the candidate" or "they".
- Default to the STAR framework (Situation, Task, Action, Result) for behavioral questions, with concrete metrics whenever possible.
- For technical questions, lead with the answer, then 2-4 supporting bullets covering trade-offs, complexity, or edge cases.
- For coding questions, name the algorithm/data structure, give the time and space complexity, and a 4-6 line pseudocode sketch.
- For system design, lead with one sentence on the chosen architecture, then bullet the components, the bottleneck, and the scaling lever.
- Never invent specific employers, projects, or numbers. If the candidate's resume doesn't supply them, use placeholders like [Company] or [X%].
- Keep answers tight enough to deliver in 60-90 seconds when spoken aloud unless the user asks for "Full".
- Output FORMATS:
  - "short": one or two sentences, no preamble.
  - "full": short headline, then a STAR or structured paragraph, then a one-line speaking tip.
  - "bullets": 3-5 punchy bullets, no preamble.
- Never apologize, never refuse, never include disclaimers. The user is in a live interview — every word must be useful.`;

function buildSystem(profile) {
  const parts = [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }];

  if (profile && (profile.role || profile.company || profile.resumeText || profile.jdText)) {
    const ctx = [
      profile.role ? `Target role: ${profile.role}` : null,
      profile.company ? `Target company: ${profile.company}` : null,
      profile.language ? `Language: ${profile.language}` : null,
      profile.resumeText ? `\n--- Candidate resume ---\n${profile.resumeText}` : null,
      profile.jdText ? `\n--- Job description ---\n${profile.jdText}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    parts.push({
      type: 'text',
      text: `\n\n# Candidate context\n${ctx}`,
      cache_control: { type: 'ephemeral' },
    });
  }

  return parts;
}

const FORMATS = {
  short:   'Format: SHORT — one or two sentences, no preamble. Just the spoken answer.',
  full:    'Format: FULL — a short headline, a structured paragraph (STAR if behavioral), then one short speaking tip.',
  bullets: 'Format: BULLETS — 3-5 punchy bullets, no preamble.',
};

const MAX_TOKENS_FOR = { short: 200, full: 1024, bullets: 600 };

const insertEvent = db.prepare(
  'INSERT INTO session_events (session_id, role, format, text) VALUES (?, ?, ?, ?)'
);
const ownsSession = db.prepare('SELECT id FROM sessions WHERE id = ? AND user_id = ?');

export function registerAnswerRoute(app) {
  app.post('/api/answer', requireAuth, async (req, res) => {
    if (!client) return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured on the server' });

    const { question, format = 'full', profile = {}, sessionId } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'question is required' });
    }

    let scopedSessionId = null;
    if (sessionId != null) {
      const owned = ownsSession.get(Number(sessionId), req.user.id);
      if (!owned) return res.status(400).json({ error: 'session not found' });
      scopedSessionId = owned.id;
    }

    const fmt = FORMATS[format] || FORMATS.full;
    const userText = `${fmt}\n\nInterviewer's question:\n${question.trim()}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const send = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    let aborted = false;
    let collected = '';
    req.on('close', () => { aborted = true; });

    if (scopedSessionId) {
      try { insertEvent.run(scopedSessionId, 'interviewer', null, question.trim()); } catch {}
    }

    try {
      const stream = client.messages.stream({
        model: modelIdForUser(req.user),
        max_tokens: MAX_TOKENS_FOR[format] || MAX_TOKENS_FOR.full,
        system: buildSystem(profile),
        messages: [{ role: 'user', content: userText }],
      });

      stream.on('text', (delta) => {
        if (aborted) return;
        collected += delta;
        send('delta', { text: delta });
      });

      const final = await stream.finalMessage();
      if (!aborted) {
        if (scopedSessionId && collected) {
          try { insertEvent.run(scopedSessionId, 'aiyedrix', format, collected); } catch {}
        }
        send('done', {
          stop_reason: final.stop_reason,
          usage: final.usage,
          model: final.model,
        });
        res.end();
      }
    } catch (err) {
      if (!aborted) {
        const status = err?.status || 500;
        const message = err?.message || 'Unknown error';
        console.error('answer error:', status, message);
        send('error', { status, message });
        res.end();
      }
    }
  });
}
