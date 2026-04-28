import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET not set. Copy .env.example to .env and set a value.');
  process.exit(1);
}

const TOKEN_TTL = '7d';
const COOKIE_NAME = 'aiy_session';

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, createdAt: u.created_at };
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'unauthenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
    if (!user) return res.status(401).json({ error: 'unauthenticated' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'unauthenticated' });
  }
}

export function registerAuthRoutes(app) {
  app.post('/api/auth/signup', (req, res) => {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ error: 'email, password, and name are required' });
    if (typeof email !== 'string' || !email.includes('@')) return res.status(400).json({ error: 'invalid email' });
    if (password.length < 8) return res.status(400).json({ error: 'password must be at least 8 characters' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) return res.status(409).json({ error: 'an account with that email already exists' });

    const hash = bcrypt.hashSync(password, 10);
    const info = db
      .prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)')
      .run(email.toLowerCase(), name.trim(), hash);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);

    setSessionCookie(res, signToken(user));
    res.json({ user: publicUser(user) });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'invalid email or password' });
    }

    setSessionCookie(res, signToken(user));
    res.json({ user: publicUser(user) });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'unauthenticated' });
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
      if (!user) return res.status(401).json({ error: 'unauthenticated' });
      res.json({ user: publicUser(user) });
    } catch {
      res.status(401).json({ error: 'unauthenticated' });
    }
  });
}
