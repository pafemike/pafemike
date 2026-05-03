// Unified Aiyedrix API client. Loaded by every page that talks to the backend.
// Profiles already get exposed via assets/js/profiles-api.js — this adds the rest.

(function () {
  async function call(path, opts = {}) {
    const res = await fetch(path, {
      headers: opts.body ? { 'Content-Type': 'application/json' } : {},
      credentials: 'same-origin',
      ...opts,
    });
    let data = {};
    if (res.status !== 204) { try { data = await res.json(); } catch {} }
    if (!res.ok) {
      const err = new Error(data.error || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  const A = (window.aiyedrix = window.aiyedrix || {});

  A.questions = {
    list: (params = {}) => {
      const qs = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null && v !== '')).toString();
      return call('/api/questions' + (qs ? `?${qs}` : '')).then((d) => d.questions);
    },
    get: (idOrSlug) => call(`/api/questions/${encodeURIComponent(idOrSlug)}`).then((d) => d.question),
    bumpView: (id) => call(`/api/questions/${id}/view`, { method: 'POST', body: '{}' }).catch(() => null),
  };

  A.sessions = {
    list:   () => call('/api/sessions').then((d) => d.sessions),
    get:    (id) => call(`/api/sessions/${id}`).then((d) => d.session),
    create: (body) => call('/api/sessions', { method: 'POST', body: JSON.stringify(body) }).then((d) => d.session),
    appendEvent: (id, body) => call(`/api/sessions/${id}/events`, { method: 'POST', body: JSON.stringify(body) }).then((d) => d.event),
    end:    (id, body = {}) => call(`/api/sessions/${id}/end`, { method: 'POST', body: JSON.stringify(body) }).then((d) => d.session),
    delete: (id) => call(`/api/sessions/${id}`, { method: 'DELETE' }),
  };

  A.settings = {
    get:   () => call('/api/settings'),
    patch: (body) => call('/api/settings', { method: 'PATCH', body: JSON.stringify(body) }),
  };
})();
