// Thin Profiles API client. Attaches to window.aiyedrix.profiles for use by
// non-module page scripts. Every method returns a promise that resolves to a
// profile or list of profiles, or throws an Error with a `.status` property.

(function () {
  async function call(path, opts = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      ...opts,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  const api = {
    list:   () =>            call('/api/profiles').then((d) => d.profiles),
    get:    (id) =>          call(`/api/profiles/${id}`).then((d) => d.profile),
    create: (body) =>        call('/api/profiles', { method: 'POST', body: JSON.stringify(body) }).then((d) => d.profile),
    update: (id, body) =>    call(`/api/profiles/${id}`, { method: 'PATCH', body: JSON.stringify(body) }).then((d) => d.profile),
    setDefault: (id) =>      call(`/api/profiles/${id}/default`, { method: 'POST' }).then((d) => d.profile),
    delete: (id) =>          call(`/api/profiles/${id}`, { method: 'DELETE' }),
  };

  window.aiyedrix = window.aiyedrix || {};
  window.aiyedrix.profiles = api;
})();
