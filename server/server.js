import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import './db.js';
import { registerAuthRoutes } from './auth.js';
import { registerAnswerRoute } from './answer.js';
import { registerProfileRoutes } from './profiles.js';
import { registerSessionRoutes } from './sessions.js';
import { registerQuestionRoutes } from './questions.js';
import { registerSettingsRoutes } from './settings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

registerAuthRoutes(app);
registerAnswerRoute(app);
registerProfileRoutes(app);
registerSessionRoutes(app);
registerQuestionRoutes(app);
registerSettingsRoutes(app);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use(express.static(ROOT, { extensions: ['html'] }));

app.use((_req, res) => res.status(404).send('Not found'));

app.listen(PORT, () => {
  console.log(`Aiyedrix listening on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('  (set ANTHROPIC_API_KEY in .env to enable AI answers)');
  }
});
