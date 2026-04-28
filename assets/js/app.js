(function () {
  const shell = document.querySelector('.app-shell');
  if (!shell) return;
  const base = shell.dataset.base || '';
  const page = shell.dataset.page || 'dashboard';

  const NAV = [
    { group: null, items: [
      { id: 'dashboard', label: 'Home',                href: 'app.html',          icon: home() },
    ]},
    { group: 'INTERVIEW', items: [
      { id: 'copilot',   label: 'AI Interview Copilot', href: 'pages/copilot.html', icon: chat() },
      { id: 'mock',      label: 'AI Mock',              href: 'pages/mock.html',    icon: bot() },
      { id: 'profiles',  label: 'Interview Profiles',   href: 'pages/profiles.html',icon: idCard() },
    ]},
    { group: 'PREPARE', items: [
      { id: 'questions', label: 'Question Bank',        href: 'pages/questions.html', icon: book(), badge: 'New' },
      { id: 'knowledge', label: 'Knowledge Base',       href: 'pages/knowledge.html', icon: dots() },
      { id: 'playground',label: 'Playground',           href: 'pages/playground.html',icon: play() },
    ]},
    { group: 'REVIEW', items: [
      { id: 'reports',   label: 'Interview Reports',    href: 'pages/reports.html',  icon: chart() },
      { id: 'tools',     label: 'AI Tools',             href: 'pages/tools.html',    icon: spark() },
    ]},
  ];

  const FOOTER = [
    { id: 'desktop',  label: 'Desktop App',  href: '#',                  icon: desktop(), external: true },
    { id: 'help',     label: 'Help Center',  href: '#',                  icon: help(),    external: true },
    { id: 'settings', label: 'Settings',     href: 'pages/settings.html',icon: gear() },
  ];

  function href(rel) {
    if (rel === '#' || /^https?:/.test(rel)) return rel;
    if (page === 'dashboard') return rel;
    if (rel === 'app.html') return base + 'app.html';
    if (rel.startsWith('pages/')) return base + rel;
    return rel;
  }

  function loginHref() { return base + 'pages/login.html'; }

  // ===== auth gate =====
  function getCachedUser() {
    try { return JSON.parse(localStorage.getItem('aiy.user') || 'null'); }
    catch { return null; }
  }
  function setCachedUser(u) {
    if (u) localStorage.setItem('aiy.user', JSON.stringify(u));
    else localStorage.removeItem('aiy.user');
  }
  async function fetchMe() {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
    if (!res.ok) return null;
    const { user } = await res.json();
    setCachedUser(user);
    return user;
  }
  function initials(name) {
    if (!name) return 'A';
    return name.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  }
  function firstName(name) { return (name || 'there').split(/\s+/)[0]; }

  let user = getCachedUser();
  if (!user) {
    fetchMe().then((u) => { if (u) renderShell(u); else location.href = loginHref(); });
  } else {
    renderShell(user);
    fetchMe().catch(() => {}); // refresh in background; if it 401s on next request the API will reject
  }

  function renderShell(currentUser) {
    user = currentUser;

    // Inject first-name placeholder if present (dashboard greeting)
    const fn = document.getElementById('userFirstName');
    if (fn) fn.textContent = firstName(user.name);

    function renderItem(item) {
      const active = item.id === page ? ' active' : '';
      const ext = item.external ? '<svg class="ext" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M20 14v6H4V4h6"/></svg>' : '';
      const badge = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
      return `<a class="nav-item${active}" href="${href(item.href)}" data-id="${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
        ${badge}${ext}
      </a>`;
    }

    function renderGroup(group) {
      const heading = group.group ? `<div class="nav-group">${group.group}</div>` : '';
      return heading + group.items.map(renderItem).join('');
    }

    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
      <header class="side-head">
        <a class="brand" href="${href('app.html')}">
          <span class="brand-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <defs><linearGradient id="sg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
              <path d="M16 2 L29 28 H22 L20 23 H12 L10 28 H3 Z M14 17 H18 L16 11 Z" fill="url(#sg)"/>
            </svg>
          </span>
          <span class="brand-text">Aiyedrix</span>
        </a>
        <button class="icon-btn collapse" data-toggle="sidebar" aria-label="Collapse">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>
        </button>
      </header>

      <nav class="side-nav">${NAV.map(renderGroup).join('')}</nav>

      <div class="side-promo card">
        <header><b>Try our Desktop App</b><button class="x" aria-label="Dismiss">×</button></header>
        <p class="muted small">Get Stealth Mode and other exclusive features on your desktop.</p>
        <button class="btn btn-ghost btn-sm">Download ›</button>
      </div>

      <nav class="side-nav side-foot">${FOOTER.map(renderItem).join('')}</nav>

      <div class="user-card">
        <a class="user-link" href="${href('pages/settings.html')}" aria-label="Account settings">
          <div class="avatar">${initials(user.name)}</div>
          <div class="user-meta"><b>${escapeHtml(user.name)}</b><small class="muted">FREE</small></div>
        </a>
        <button class="icon-btn signout" id="signoutBtn" aria-label="Sign out" title="Sign out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    `;

    document.querySelectorAll('[data-toggle="sidebar"]').forEach(btn =>
      btn.addEventListener('click', () => shell.classList.toggle('collapsed'))
    );

    const x = sidebar.querySelector('.side-promo .x');
    if (x) x.addEventListener('click', () => sidebar.querySelector('.side-promo').remove());

    document.getElementById('signoutBtn').addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      setCachedUser(null);
      location.href = loginHref();
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // expose current user for other scripts (copilot.js, playground)
  window.aiyedrix = window.aiyedrix || {};
  Object.defineProperty(window.aiyedrix, 'user', { get: () => user });

  // ===== icons =====
  function home(){return svg('<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>')}
  function chat(){return svg('<path d="M21 15a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>')}
  function bot(){return svg('<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 14h.01M15 14h.01M2 14h2M20 14h2"/>')}
  function idCard(){return svg('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.5"/><path d="M14 11h5M14 15h5M5 17c.8-1.5 2.4-2.5 4-2.5s3.2 1 4 2.5"/>')}
  function book(){return svg('<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 4v14"/>')}
  function dots(){return svg('<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>')}
  function play(){return svg('<circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>')}
  function chart(){return svg('<path d="M4 20V8M10 20V4M16 20v-7M22 20H2"/>')}
  function spark(){return svg('<path d="M12 3v6M12 15v6M3 12h6M15 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4"/>')}
  function gear(){return svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>')}
  function help(){return svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.5 1.5c-.6.6-1.5 1-1.5 2"/><path d="M12 17h.01"/>')}
  function desktop(){return svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>')}
  function svg(inner){return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`}
})();
