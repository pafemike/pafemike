(function () {
  let step = 1;
  const TOTAL = 3;
  const stepPill = document.getElementById('stepPill');
  const continueBtn = document.getElementById('continueBtn');
  const stepsEls = document.querySelectorAll('.wizard-step');
  const wizard = document.getElementById('wizard');
  const live = document.getElementById('live');

  function setStep(n) {
    step = Math.min(Math.max(1, n), TOTAL);
    stepPill.textContent = `STEP ${step} / ${TOTAL}`;
    stepsEls.forEach(el => el.classList.toggle('active', Number(el.dataset.step) === step));
    continueBtn.textContent = step === TOTAL ? 'Go live →' : 'Continue →';
  }

  continueBtn.addEventListener('click', () => {
    if (step < TOTAL) setStep(step + 1);
    else goLive();
  });

  document.querySelectorAll('.tile.select').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tile.select').forEach(x => x.classList.remove('chosen'));
      t.classList.add('chosen');
    });
  });

  document.querySelectorAll('.chips .chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('.chips .chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
    });
  });

  const goBtn = document.getElementById('goLive');
  if (goBtn) goBtn.addEventListener('click', goLive);

  function readProfile() {
    const role = document.querySelector('[data-step="2"] input[placeholder*="Senior Backend"]')?.value || '';
    const company = document.querySelector('[data-step="2"] input[placeholder*="Stripe"]')?.value || '';
    const lang = document.querySelector('[data-step="2"] select:nth-of-type(1)')?.value || 'English (US)';
    const jd = document.querySelector('[data-step="2"] textarea')?.value || '';
    return { role, company, language: lang, jdText: jd };
  }

  let liveProfile = null;

  function goLive() {
    liveProfile = readProfile();
    wizard.classList.add('hidden');
    live.classList.remove('hidden');
    stepPill.textContent = '● LIVE';
    stepPill.classList.add('live-pill');
    continueBtn.classList.add('hidden');
  }

  let currentMode = 'full';

  document.querySelectorAll('.live .seg-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.live .seg-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      currentMode = b.dataset.len;
      const lastQ = document.getElementById('answer').dataset.q;
      if (lastQ) askAiyedrix(lastQ, currentMode);
    });
  });

  document.getElementById('regen')?.addEventListener('click', () => {
    const lastQ = document.getElementById('answer').dataset.q;
    if (lastQ) askAiyedrix(lastQ, currentMode);
  });

  document.getElementById('copyAns')?.addEventListener('click', async () => {
    const btn = document.getElementById('copyAns');
    const text = document.getElementById('answer').innerText;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = '✓ Copied';
      setTimeout(() => { btn.textContent = '⧉ Copy'; }, 1200);
    } catch {}
  });

  document.getElementById('askBtn')?.addEventListener('click', () => {
    const input = document.getElementById('manualQ');
    const v = input.value.trim();
    if (!v) return;
    const t = document.getElementById('transcript');
    const p = document.createElement('p');
    p.className = 't-line';
    p.innerHTML = `<b>Interviewer:</b> ${escapeHtml(v)}`;
    t.appendChild(p);
    t.scrollTop = t.scrollHeight;
    input.value = '';
    askAiyedrix(v, currentMode);
  });

  document.getElementById('manualQ')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('askBtn').click(); }
  });

  document.getElementById('endSession')?.addEventListener('click', () => {
    location.href = 'reports.html';
  });

  // ===== streaming AI call =====
  let activeController = null;

  async function askAiyedrix(question, format) {
    const ans = document.getElementById('answer');
    ans.dataset.q = question;
    ans.innerHTML = '<p class="muted small">Thinking…</p>';

    if (activeController) activeController.abort();
    activeController = new AbortController();

    let res;
    try {
      res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, format, profile: liveProfile || {} }),
        signal: activeController.signal,
      });
    } catch (e) {
      if (e.name !== 'AbortError') ans.innerHTML = renderError('Network error — is the server running?');
      return;
    }

    if (res.status === 401) { location.href = '../pages/login.html'; return; }
    if (res.status === 503) { ans.innerHTML = renderError('AI is not configured. Set <code>ANTHROPIC_API_KEY</code> in <code>.env</code> and restart the server.'); return; }
    if (!res.ok) { ans.innerHTML = renderError(`Server error (${res.status})`); return; }

    let buf = '';
    ans.textContent = '';
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let raw = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      raw += decoder.decode(value, { stream: true });
      let ix;
      while ((ix = raw.indexOf('\n\n')) !== -1) {
        const chunk = raw.slice(0, ix); raw = raw.slice(ix + 2);
        const ev = parseSSE(chunk);
        if (!ev) continue;
        if (ev.event === 'delta') {
          buf += ev.data.text;
          ans.textContent = buf;
        } else if (ev.event === 'error') {
          ans.innerHTML = renderError(ev.data.message || 'Model error');
          return;
        } else if (ev.event === 'done') {
          ans.innerHTML = mdLite(buf);
          return;
        }
      }
    }
    if (buf) ans.innerHTML = mdLite(buf);
  }

  function parseSSE(chunk) {
    const lines = chunk.split('\n');
    let event = 'message', data = '';
    for (const ln of lines) {
      if (ln.startsWith('event: ')) event = ln.slice(7).trim();
      else if (ln.startsWith('data: ')) data += ln.slice(6);
    }
    try { return { event, data: JSON.parse(data) }; } catch { return null; }
  }

  function mdLite(s) {
    const esc = escapeHtml(s);
    const lines = esc.split('\n');
    const out = [];
    let inList = false;
    for (const raw of lines) {
      const ln = raw.trimEnd();
      if (/^\s*[-*]\s+/.test(ln)) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push(`<li>${ln.replace(/^\s*[-*]\s+/, '')}</li>`);
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        if (ln.trim() === '') out.push('');
        else out.push(`<p>${ln}</p>`);
      }
    }
    if (inList) out.push('</ul>');
    return out.join('\n')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\*([^*]+)\*/g, '<i>$1</i>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function renderError(msg) { return `<p class="error-block">${msg}</p>`; }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  // honor ?mode= from dashboard tiles
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode');
  if (mode === 'coding') document.querySelector('[data-template="coding"]')?.classList.add('chosen');
  if (mode === 'phone')  document.querySelector('[data-template="phone"]')?.classList.add('chosen');
})();
