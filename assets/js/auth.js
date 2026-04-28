// Auth helpers — used by login/signup pages and by the app shell.
// All requests are same-origin and rely on the httpOnly session cookie.

export async function signup(email, password, name) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || 'Sign-up failed' };
  setCachedUser(data.user);
  return { ok: true, user: data.user };
}

export async function signin(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || 'Sign-in failed' };
  setCachedUser(data.user);
  return { ok: true, user: data.user };
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  setCachedUser(null);
  location.href = locateBase() + 'index.html';
}

export async function fetchMe() {
  const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
  if (!res.ok) return null;
  const { user } = await res.json();
  setCachedUser(user);
  return user;
}

export function getCachedUser() {
  try { return JSON.parse(localStorage.getItem('aiy.user') || 'null'); }
  catch { return null; }
}

function setCachedUser(u) {
  if (u) localStorage.setItem('aiy.user', JSON.stringify(u));
  else localStorage.removeItem('aiy.user');
}

export function initials(user) {
  if (!user?.name) return 'A';
  return user.name.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export function firstName(user) {
  return user?.name?.split(/\s+/)[0] || 'there';
}

function locateBase() {
  // Pages under /pages/* need to climb one level; root pages stay put.
  return location.pathname.includes('/pages/') ? '../' : '';
}

// Drop-in guard for protected app pages. Redirects to /pages/login.html if not signed in.
// Returns a promise that resolves to the user (or never resolves if redirected).
export async function requireUser() {
  const cached = getCachedUser();
  if (cached) {
    fetchMe().catch(() => {}); // refresh in the background
    return cached;
  }
  const fresh = await fetchMe();
  if (fresh) return fresh;
  location.href = locateBase() + 'pages/login.html';
  return new Promise(() => {}); // never resolves; we're navigating away
}
