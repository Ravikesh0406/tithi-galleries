/* Tithi web app - API-backed galleries/uploads, mobile-friendly. */
(function () {
  const USERS_KEY = 'tithi_users';
  const USER_KEY = 'tithi_user';
  const getJSON = (k, dflt) => { try { return JSON.parse(localStorage.getItem(k)) || dflt; } catch { return dflt; } };
  const setJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const el = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const note = (m) => { const out = el('#out'); if (out) out.innerHTML = m; };
  const fmtDate = (d) => { if (!d) return ''; try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } };

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      headers: opts.body instanceof FormData ? undefined : { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
    return data;
  }

  // ---------- auth ----------
  function getUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } }
  function setUser(u) { localStorage.setItem(USER_KEY, JSON.stringify(u)); }
  function logout() { localStorage.removeItem(USER_KEY); window.location.href = 'login.html'; }
  function login(username, password) {
    const users = getJSON(USERS_KEY, []);
    const u = users.find((x) => x.username === username && x.password === password);
    if (u) { setUser({ id: u.id, username: u.username }); return u; }
    return null;
  }

  // ---------- galleries API ----------
  async function getGalleries() { return api('/api/galleries'); }
  async function getGallery(id) { return api(`/api/galleries/${encodeURIComponent(id)}`); }
  async function createGallery(payload) {
    return api('/api/galleries', { method: 'POST', body: JSON.stringify(payload) });
  }
  async function addPhotoUrl(galleryId, url, caption = '') {
    return api(`/api/galleries/${encodeURIComponent(galleryId)}/photos`, { method: 'POST', body: JSON.stringify({ url, caption }) });
  }
  async function uploadPhotoFile(galleryId, file, caption = '') {
    const fd = new FormData();
    fd.append('photo', file);
    if (caption) fd.append('caption', caption);
    return api(`/api/galleries/${encodeURIComponent(galleryId)}/photos`, { method: 'POST', body: fd });
  }
  function galleryPage(g) { return `gallery.html?g=${encodeURIComponent(g.id)}`; }

  // ---------- auth pages ----------
  function authPage() {
    const form = el('#auth-form'); if (!form) return;
    const mode = location.pathname.split('/').pop() === 'signup.html' ? 'register' : 'login';
    const submit = (m) => {
      const username = el('#username').value.trim();
      const password = el('#password').value;
      if (!username || !password) { note('<p class="alert">Please fill in the username and password.</p>'); return; }
      if (m === 'register') {
        const users = getJSON(USERS_KEY, []);
        if (users.some((x) => x.username === username)) { note('<p class="alert">This username is already taken. Try another one.</p>'); return; }
        users.push({ id: Math.random().toString(36).slice(2), username, password, createdAt: new Date().toISOString() });
        setJSON(USERS_KEY, users);
      }
      const u = login(username, password);
      if (!u) { note('<p class="alert">Login failed. Check your username and password.</p>'); return; }
      window.location.href = 'dashboard.html';
    };
    el('#register-btn') && el('#register-btn').addEventListener('click', () => submit('register'));
    el('#login-btn') && el('#login-btn').addEventListener('click', () => submit('login'));
    form.addEventListener('submit', (e) => { e.preventDefault(); submit(mode); });
  }

  // ---------- dashboard ----------
  async function dashboardPage() {
    const user = getUser();
    const dash = el('#dash'); if (!dash) return;
    dash.innerHTML = `
      <div class="container dash-wrap">
        <div class="dash-header">
          <div>
            <h1>Photographer Dashboard</h1>
            <p class="muted">Create galleries, connect your camera, and post photos live.</p>
          </div>
          <button class="btn btn-ghost" id="logout">Sign out${user ? ` (${esc(user.username)})` : ''}</button>
        </div>

        <div class="dash-grid">
          <section class="dash-card">
            <h2>Create a gallery</h2>
            <p class="muted">Start a new event gallery. You’ll get a shareable link and QR code.</p>
            <div class="form-stack">
              <input id="gallery-name" placeholder="Gallery name (e.g., Aditi &amp; Rohan – Wedding)" />
              <input id="event-date" type="date" />
              <input id="gallery-desc" placeholder="Description (venue, city, occasion)" />
              <button class="btn btn-primary" id="create-gallery">Create Gallery</button>
            </div>
            <div id="create-out" class="inline-note"></div>
          </section>

          <section class="dash-card">
            <h2>Camera to Cloud (Live)</h2>
            <p class="muted">Use your phone camera to capture photos and upload them directly to the selected gallery. Works on Android and iPhone browsers.</p>
            <div class="form-stack">
              <select id="camera-gallery-pick" aria-label="Select gallery for camera upload"><option value="">Loading galleries…</option></select>
              <label class="file-btn btn btn-primary" for="camera-input">📷 Open Camera &amp; Upload</label>
              <input id="camera-input" type="file" accept="image/*" capture="environment" class="hidden-input" />
              <label class="file-btn btn btn-ghost" for="multi-input">🖼️ Upload from device</label>
              <input id="multi-input" type="file" accept="image/*" multiple class="hidden-input" />
              <div id="camera-status" class="inline-note muted">Select a gallery, then take or upload a photo. It will appear in the gallery live.</div>
            </div>
          </section>
        </div>

        <section class="dash-card" style="margin-top:20px">
          <h2>Manual post by URL</h2>
          <p class="muted">Paste an image URL and post it directly to a gallery.</p>
          <div class="create-form">
            <select id="gallery-pick" aria-label="Select gallery for URL post"><option value="">Select gallery…</option></select>
            <input id="photo-url" placeholder="Photo URL (https://...)" />
            <button class="btn btn-primary" id="manual-upload">Add photo</button>
          </div>
          <div id="manual-out" class="inline-note"></div>
        </section>

        <section class="dash-card" style="margin-top:20px">
          <div class="dash-header" style="margin-bottom:10px">
            <h2 style="margin:0">Your galleries</h2>
            <button class="btn btn-ghost btn-sm" id="refresh-galleries">Refresh</button>
          </div>
          <div id="galleries-list"><p class="muted">Loading galleries…</p></div>
        </section>
      </div>`;

    el('#logout').addEventListener('click', logout);

    async function refreshGalleries(selectedId) {
      const list = el('#galleries-list');
      try {
        const gs = (await getGalleries()).filter(g => !g.isDemo);
        const options = `<option value="">Select gallery…</option>` + gs.map(g => `<option value="${esc(g.id)}">${esc(g.name)} (${(g.photos||[]).length})</option>`).join('');
        el('#gallery-pick').innerHTML = options;
        el('#camera-gallery-pick').innerHTML = options || '<option value="">No galleries yet</option>';
        if (selectedId) { el('#gallery-pick').value = selectedId; el('#camera-gallery-pick').value = selectedId; }
        if (!gs.length) {
          list.innerHTML = '<p class="gallery-empty">No galleries yet. Create your first gallery above.</p>';
          return;
        }
        list.innerHTML = `<div class="gallery-list">${gs.map(g => `
          <div class="gallery-item" onclick="go('${galleryPage(g)}')">
            <div>
              <div class="gi-name"><strong>${esc(g.name)}</strong> <span class="tag">${(g.photos||[]).length} photos</span></div>
              <div class="muted" style="font-size:.85rem">${esc(g.eventDate ? fmtDate(g.eventDate) : 'No event date')} ${g.description ? '· ' + esc(g.description) : ''}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <a class="btn btn-ghost btn-sm" href="${galleryPage(g)}" onclick="event.stopPropagation()">Open</a>
            </div>
          </div>`).join('')}</div>`;
      } catch (e) {
        list.innerHTML = `<p class="alert">${esc(e.message)}</p>`;
      }
    }

    el('#create-gallery').addEventListener('click', async () => {
      const btn = el('#create-gallery');
      const name = el('#gallery-name').value.trim();
      const eventDate = el('#event-date').value || null;
      const description = el('#gallery-desc').value.trim();
      if (!name) { el('#create-out').innerHTML = '<p class="alert">Give your gallery a name.</p>'; return; }
      btn.disabled = true; btn.textContent = 'Creating…';
      try {
        const g = await createGallery({ name, eventDate, description });
        el('#create-out').innerHTML = `<p style="color:#16a34a">Gallery created. <a href="${galleryPage(g)}">Open gallery</a></p>`;
        el('#gallery-name').value = ''; el('#gallery-desc').value = ''; el('#event-date').value = '';
        await refreshGalleries(g.id);
      } catch (e) {
        el('#create-out').innerHTML = `<p class="alert">${esc(e.message)}</p>`;
      } finally { btn.disabled = false; btn.textContent = 'Create Gallery'; }
    });

    async function handleFiles(fileList, sourceLabel) {
      const gid = el('#camera-gallery-pick').value;
      const status = el('#camera-status');
      if (!gid) { status.innerHTML = '<span class="alert" style="display:inline-block">Select a gallery first.</span>'; return; }
      const files = Array.from(fileList || []);
      if (!files.length) return;
      for (const file of files) {
        status.innerHTML = `<span style="color:#2563eb">Uploading ${esc(file.name || sourceLabel)}…</span>`;
        try {
          await uploadPhotoFile(gid, file);
          status.innerHTML = `<span style="color:#16a34a">✅ Uploaded ${esc(file.name || 'photo')} — live in gallery now.</span>`;
        } catch (e) {
          status.innerHTML = `<span class="alert" style="display:inline-block">${esc(e.message)}</span>`;
          break;
        }
      }
      await refreshGalleries(gid);
    }

    el('#camera-input').addEventListener('change', async (e) => { await handleFiles(e.target.files, 'camera photo'); e.target.value = ''; });
    el('#multi-input').addEventListener('change', async (e) => { await handleFiles(e.target.files, 'photo'); e.target.value = ''; });

    el('#manual-upload').addEventListener('click', async () => {
      const gid = el('#gallery-pick').value;
      const url = el('#photo-url').value.trim();
      const out = el('#manual-out');
      if (!gid) { out.innerHTML = '<p class="alert">Select a gallery first.</p>'; return; }
      if (!url) { out.innerHTML = '<p class="alert">Paste a photo URL.</p>'; return; }
      const btn = el('#manual-upload'); btn.disabled = true; btn.textContent = 'Adding…';
      try {
        await addPhotoUrl(gid, url);
        out.innerHTML = '<p style="color:#16a34a">✅ Photo added — live in gallery now.</p>';
        el('#photo-url').value = '';
        await refreshGalleries(gid);
      } catch (e) { out.innerHTML = `<p class="alert">${esc(e.message)}</p>`; }
      finally { btn.disabled = false; btn.textContent = 'Add photo'; }
    });

    el('#refresh-galleries').addEventListener('click', () => refreshGalleries(el('#camera-gallery-pick').value));
    await refreshGalleries();
  }

  // ---------- public gallery ----------
  function renderGalleryGrid(container, photos, q = '') {
    const ql = q.toLowerCase().trim();
    const hits = !ql ? photos : photos.filter(p => (p.caption || '').toLowerCase().includes(ql) || (p.src || '').toLowerCase().includes(ql));
    if (!hits.length) {
      container.innerHTML = `<p class="gallery-empty">${ql ? 'No photos match your search.' : 'No photos yet. Photos will appear here as they are uploaded.'}</p>`;
      return;
    }
    container.innerHTML = `<div class="gallery-grid">${hits.slice().reverse().map(p => `
      <div class="photo-card">
        <img src="${esc(p.src)}" alt="${esc(p.caption || 'Event photo')}" loading="lazy" />
        <div class="cap">${esc(p.caption || (p.source === 'upload' ? 'Live upload' : 'Photo'))}</div>
      </div>`).join('')}</div>`;
  }

  async function galleryPageFn() {
    const params = new URLSearchParams(location.search);
    const gid = params.get('g') || params.get('id');
    const root = el('#gallery-root');
    if (!gid) { if (root) root.innerHTML = '<p class="gallery-empty">Missing gallery ID.</p>'; return; }

    let current = null;
    async function load() {
      try {
        const g = await getGallery(gid);
        current = g;
        el('#gallery-title').textContent = g.name;
        el('#gallery-date').textContent = [g.eventDate ? fmtDate(g.eventDate) : '', g.description].filter(Boolean).join(' · ');
        el('#gallery-count').textContent = `${(g.photos || []).length} photos`;
        renderGalleryGrid(el('#gallery-grid'), g.photos || [], el('#search-input') ? el('#search-input').value : '');
      } catch (e) {
        if (root) root.innerHTML = `<p class="gallery-empty">${esc(e.message)}</p>`;
      }
    }

    await load();

    const search = el('#search-input');
    if (search) search.addEventListener('input', () => { if (current) renderGalleryGrid(el('#gallery-grid'), current.photos || [], search.value); });

    const copyBtn = el('#copy-link');
    if (copyBtn) copyBtn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); copyBtn.textContent = 'Copied!'; setTimeout(() => copyBtn.textContent = 'Copy gallery link', 1500); }
      catch { prompt('Copy this link:', location.href); }
    });
    const wa = el('#wa-link');
    if (wa) wa.href = `https://wa.me/?text=${encodeURIComponent('Check out our event gallery: ' + location.href)}`;
    const qr = el('#qr-img');
    if (qr) qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(location.href)}`;

    // Live refresh so camera uploads appear automatically
    setInterval(async () => {
      try {
        const g = await getGallery(gid);
        const prev = current ? (current.photos || []).length : -1;
        current = g;
        el('#gallery-count').textContent = `${(g.photos || []).length} photos`;
        if ((g.photos || []).length !== prev) renderGalleryGrid(el('#gallery-grid'), g.photos || [], search ? search.value : '');
      } catch {}
    }, 4000);
  }

  // ---------- store (demo) ----------
  function storePage() {
    const products = [
      { id: 'p1', name: '4x6 Print', price: 49, commission: 5, src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', desc: 'Premium matte print' },
      { id: 'p2', name: 'Photo Album', price: 1499, commission: 8, src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', desc: '20-page wedding album' },
      { id: 'p3', name: 'Digital Download', price: 199, commission: 3, src: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=600&q=80', desc: 'Full-resolution file' },
      { id: 'p4', name: 'Frame + Print', price: 899, commission: 7, src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80', desc: 'Ready-to-hang frame' },
    ];
    const root = el('#store-list'); if (!root) return;
    let total = 0, commission = 0;
    root.innerHTML = `
      <div class="store-grid">${products.map(p => `
        <div class="product-card">
          <img src="${p.src}" alt="${esc(p.name)}" loading="lazy" />
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.desc)}</p>
          <div class="price-lg">₹${p.price}</div>
          <div class="muted" style="font-size:.8rem;margin-bottom:10px">Commission: ${p.commission}%</div>
          <button class="btn btn-primary btn-sm" data-buy="${p.id}">Buy (demo)</button>
        </div>`).join('')}</div>
      <div class="dash-card" style="margin-top:20px"><strong>Demo cart:</strong> <span id="cart-total">₹0</span> · <span class="muted">Commission: <span id="cart-comm">₹0</span></span></div>`;
    root.querySelectorAll('[data-buy]').forEach(btn => btn.addEventListener('click', () => {
      const p = products.find(x => x.id === btn.dataset.buy);
      total += p.price; commission += Math.round(p.price * p.commission / 100);
      el('#cart-total').textContent = `₹${total}`;
      el('#cart-comm').textContent = `₹${commission}`;
      btn.textContent = 'Added ✓';
      setTimeout(() => btn.textContent = 'Buy (demo)', 1200);
    }));
  }

  // ---------- router ----------
  function init() {
    const page = location.pathname.split('/').pop() || 'index.html';
    if (page === 'signup.html' || page === 'login.html') { if (getUser()) { location.href = 'dashboard.html'; return; } authPage(); return; }
    if (page === 'dashboard.html') { if (!getUser()) { location.href = 'login.html'; return; } dashboardPage(); return; }
    if (page === 'gallery.html') { galleryPageFn(); return; }
    if (page === 'store.html') { storePage(); return; }
  }

  window.go = (p) => { location.href = p; };
  window.Tithi = { getUser, logout, getGalleries, createGallery, addPhotoUrl, uploadPhotoFile, galleryPage };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();