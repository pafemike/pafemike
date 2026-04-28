# Aiyedrix — AI Interview Copilot

A dark-themed, real-time AI interview copilot. Inspired by the Verve AI
Interview Copilot UI but built from scratch with a self-hosted Node backend,
SQLite + email/password auth, and Anthropic's Claude API for live AI answers.

## Quick start

```sh
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# then edit .env and set:
#   - ANTHROPIC_API_KEY  (https://console.anthropic.com/)
#   - JWT_SECRET         (any long random string — see comment in .env.example)

# 3. Run
npm start
# open http://localhost:8080
```

That's it. Sign up, then jump into **AI Interview Copilot → Go live** or
**Playground** to get real Claude-powered answers.

## What's wired up

| Surface | AI? | Auth? |
|---|---|---|
| Landing page (`/`) | — | public |
| Sign up / Sign in (`/pages/signup.html`, `/pages/login.html`) | — | public |
| Dashboard (`/app.html`) | — | required |
| **AI Interview Copilot** (`/pages/copilot.html`) | **Yes — Claude streaming** | required |
| **Playground** (`/pages/playground.html`) | **Yes — Claude streaming** | required |
| AI Mock, Question Bank, Profiles, Reports, Knowledge, Tools, Settings | static UI | required |

AI answers stream in real time over Server-Sent Events. The system prompt
includes the candidate's role, target company, and job description from the
copilot wizard, and is wrapped in `cache_control: ephemeral` so repeated
questions in the same session hit Anthropic's prompt cache.

## Stack

- **Backend:** Node 18+, Express, better-sqlite3, bcryptjs, jsonwebtoken
- **AI:** `@anthropic-ai/sdk` — `claude-sonnet-4-6` by default, configurable via `ANTHROPIC_MODEL` in `.env`
- **Frontend:** plain HTML / CSS / JS — no framework, no build step
- **DB:** SQLite (auto-created at `./data/aiyedrix.db` on first run)

## Layout

```
.
├── index.html                  # Landing
├── app.html                    # Dashboard (auth required)
├── pages/                      # In-app pages + login/signup (auth-required pages)
├── server/
│   ├── server.js               # Express entrypoint + static file serving
│   ├── auth.js                 # /api/auth/* — signup, login, me, logout
│   ├── answer.js               # /api/answer — Claude streaming endpoint
│   └── db.js                   # SQLite schema + connection
├── assets/
│   ├── css/{main,app}.css      # Dark theme + in-app shell
│   └── js/
│       ├── app.js              # Sidebar shell + auth gate (loads on every app page)
│       ├── auth.js             # Browser auth helpers (login/signup pages)
│       ├── copilot.js          # 3-step wizard + live SSE streaming
│       └── playground.js       # Single-question playground SSE streaming
├── package.json
├── .env.example                # Copy to .env
└── .gitignore                  # Excludes data/, .env, node_modules
```

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | — | `{ email, password (≥8), name }` → sets session cookie |
| `POST` | `/api/auth/login` | — | `{ email, password }` → sets session cookie |
| `GET`  | `/api/auth/me` | cookie | Returns current user |
| `POST` | `/api/auth/logout` | cookie | Clears session cookie |
| `POST` | `/api/answer` | cookie | `{ question, format: short\|full\|bullets, profile }` → SSE stream of Claude's answer |
| `GET`  | `/api/health` | — | `{ ok: true }` |

Auth uses an httpOnly JWT cookie (`aiy_session`, 7-day TTL). Passwords are
bcrypt-hashed (10 rounds). The DB is local SQLite — no external service.

## Production notes

This is a local-first build. Before deploying, at minimum:

1. Generate a real `JWT_SECRET` (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
2. Set `NODE_ENV=production` (the cookie becomes `Secure`)
3. Put it behind HTTPS — or the cookie won't get sent
4. Add rate limiting on `/api/auth/*` and `/api/answer`
5. Pick a backup strategy for `data/aiyedrix.db`
