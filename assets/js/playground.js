(function () {
  const segs = document.querySelectorAll('.seg-btn');
  let mode = 'short';
  segs.forEach(b => b.addEventListener('click', () => {
    segs.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    mode = b.dataset.len;
  }));

  const goBtn = document.getElementById('pgGo');
  const out = document.getElementById('pgOut');
  const qInput = document.getElementById('pgQ');

  let active = null;

  goBtn.addEventListener('click', async () => {
    const question = (qInput.value || '').trim();
    if (!question) return;
    if (active) active.abort();
    active = new AbortController();

    out.textContent = '';
    out.innerHTML = '<p class="muted small">Thinking…</p>';

    let res;
    try {
      res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, format: mode }),
        signal: active.signal,
      });
    } catch (e) {
      if (e.name !== 'AbortError') out.innerHTML = error('Network error — is the server running?');
      return;
    }

    if (res.status === 401) { location.href = 'login.html'; return; }
    if (res.status === 503) { out.innerHTML = error('AI is not configured. Set <code>ANTHROPIC_API_KEY</code> in <code>.env</code> and restart the server.'); return; }
    if (!res.ok) { out.innerHTML = error(`Server error (${res.status})`); return; }

    let buf = '';
    out.textContent = '';
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
        if (ev.event === 'delta') { buf += ev.data.text; out.textContent = buf; }
        else if (ev.event === 'error') { out.innerHTML = error(ev.data.message || 'Model error'); return; }
        else if (ev.event === 'done') { out.innerHTML = render(buf); return; }
      }
    }
    if (buf) out.innerHTML = render(buf);
  });

  function parseSSE(chunk) {
    const lines = chunk.split('\n');
    let event = 'message', data = '';
    for (const ln of lines) {
      if (ln.startsWith('event: ')) event = ln.slice(7).trim();
      else if (ln.startsWith('data: ')) data += ln.slice(6);
    }
    try { return { event, data: JSON.parse(data) }; } catch { return null; }
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function error(msg) { return `<p class="error-block">${msg}</p>`; }
  function render(s) {
    const esc = escapeHtml(s);
    const lines = esc.split('\n');
    const out = [];
    let inList = false;
    for (const ln of lines) {
      const t = ln.trim();
      if (/^[-*]\s+/.test(t)) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push(`<li>${t.replace(/^[-*]\s+/, '')}</li>`);
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        if (t === '') out.push('');
        else out.push(`<p>${t}</p>`);
      }
    }
    if (inList) out.push('</ul>');
    return out.join('\n').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<i>$1</i>').replace(/`([^`]+)`/g, '<code>$1</code>');
  }
})();
