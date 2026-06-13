(() => {
  let auth = null;
  let db = null;
  let currentUser = null;
  let isAdmin = false;
  let unsubUsers = null;
  let injected = false;

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));

  function toast(message) {
    const el = $('toast');
    if (!el) return alert(message);
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { el.hidden = true; }, 4200);
  }

  function injectStyles() {
    if ($('adminUsersStyles')) return;
    const style = document.createElement('style');
    style.id = 'adminUsersStyles';
    style.textContent = `
      .admin-users-card{display:none}
      .admin-users-card.show{display:block}
      .admin-users-list{display:grid;gap:10px}
      .admin-user-row{
        display:grid;
        grid-template-columns:48px minmax(0,1fr) 100px auto;
        gap:10px;
        align-items:center;
        padding:12px;
        border-radius:18px;
        background:rgba(255,255,255,.025);
        border:1px solid rgba(255,255,255,.07);
      }
      .admin-user-avatar{
        width:44px;height:44px;border-radius:50%;display:grid;place-items:center;
        background:radial-gradient(circle at 35% 25%,#f3d58a,#986f25);
        color:#1e1304;font-weight:950;border:1px solid var(--gold);
      }
      .admin-user-main small{display:block;color:var(--muted);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .admin-user-row .input{min-height:42px;border-radius:14px}
      .admin-user-actions{display:flex;gap:8px;align-items:center;justify-content:flex-end}
      .admin-users-note{color:var(--muted);margin:0 0 14px;line-height:1.45}
      @media(max-width:760px){
        .admin-user-row{grid-template-columns:44px 1fr;align-items:start}
        .admin-user-row .input,.admin-user-actions{grid-column:2}
        .admin-user-actions{justify-content:flex-start;flex-wrap:wrap}
      }
    `;
    document.head.appendChild(style);
  }

  function ensurePanel() {
    if ($('adminUsersCard')) return true;
    const profilePage = $('page-profile');
    if (!profilePage) return false;
    const card = document.createElement('article');
    card.className = 'card admin-users-card';
    card.id = 'adminUsersCard';
    card.innerHTML = `
      <div class="card-title split">
        <div>
          <span class="nav-icon gold" data-icon="profile"></span>
          <h2>Admin: brukerstyring</h2>
        </div>
      </div>
      <p class="admin-users-note">Endre brukernavn og sjakk-ELO for registrerte brukere.</p>
      <div class="admin-users-list" id="adminUsersList">
        <div class="empty">Laster brukere...</div>
      </div>
    `;
    const firstCardAfterStats = profilePage.querySelector('.stats-grid.profile-stats');
    if (firstCardAfterStats && firstCardAfterStats.nextSibling) {
      profilePage.insertBefore(card, firstCardAfterStats.nextSibling);
    } else {
      profilePage.appendChild(card);
    }
    return true;
  }

  function setPanelVisible() {
    const card = $('adminUsersCard');
    if (card) card.classList.toggle('show', !!isAdmin);
  }

  function renderUsers(users) {
    ensurePanel();
    const list = $('adminUsersList');
    if (!list) return;
    if (!users.length) {
      list.innerHTML = '<div class="empty">Ingen brukere funnet.</div>';
      return;
    }
    list.innerHTML = users.map(u => {
      const initial = esc((u.name || u.email || 'S').trim()[0] || 'S').toUpperCase();
      const name = esc(u.name || 'Spiller');
      const email = esc(u.email || '');
      const elo = Number(u.elo || 1000);
      const uid = esc(u.uid || u.id);
      return `
        <div class="admin-user-row" data-admin-user="${uid}">
          <div class="admin-user-avatar">${initial}</div>
          <div class="admin-user-main">
            <input class="input admin-name-input" value="${name}" placeholder="Brukernavn">
            <small>${email}${u.isAdmin ? ' · Admin' : ''}</small>
          </div>
          <input class="input admin-elo-input" type="number" min="100" max="4000" step="1" value="${elo}" aria-label="Sjakk ELO">
          <div class="admin-user-actions">
            <button class="btn primary compact admin-save-user" type="button">Lagre</button>
          </div>
        </div>
      `;
    }).join('');
    list.querySelectorAll('.admin-save-user').forEach(btn => {
      btn.addEventListener('click', () => saveUser(btn.closest('[data-admin-user]')));
    });
  }

  async function saveUser(row) {
    if (!row || !isAdmin) return toast('Kun admin kan endre brukere.');
    const uid = row.dataset.adminUser;
    const nameInput = row.querySelector('.admin-name-input');
    const eloInput = row.querySelector('.admin-elo-input');
    const name = (nameInput.value || '').trim() || 'Spiller';
    const elo = Math.max(100, Math.min(4000, Math.round(Number(eloInput.value || 1000))));
    try {
      await db.collection('users').doc(uid).update({
        name,
        elo,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtMs: Date.now()
      });
      toast('Bruker oppdatert.');
    } catch (e) {
      console.error(e);
      toast((e.code ? e.code + ': ' : '') + (e.message || 'Kunne ikke lagre bruker'));
    }
  }

  function listenUsers() {
    if (unsubUsers) {
      try { unsubUsers(); } catch {}
      unsubUsers = null;
    }
    if (!isAdmin) {
      renderUsers([]);
      return;
    }
    unsubUsers = db.collection('users').onSnapshot(snap => {
      const users = snap.docs.map(d => ({ id: d.id, uid: d.id, ...d.data() }))
        .sort((a, b) => String(a.name || a.email || '').localeCompare(String(b.name || b.email || ''), 'nb'));
      renderUsers(users);
    }, e => {
      console.error(e);
      toast((e.code ? e.code + ': ' : '') + 'Kunne ikke hente brukere');
    });
  }

  function startFirebase() {
    if (!window.firebase || !window.VM_FIREBASE_CONFIG) return;
    if (!firebase.apps.length) firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
    auth.onAuthStateChanged(async u => {
      currentUser = u;
      isAdmin = false;
      setPanelVisible();
      if (!u) {
        listenUsers();
        return;
      }
      try {
        const me = await db.collection('users').doc(u.uid).get();
        isAdmin = me.exists && me.data().isAdmin === true;
        setPanelVisible();
        listenUsers();
      } catch (e) {
        console.error(e);
        toast((e.code ? e.code + ': ' : '') + 'Kunne ikke sjekke admin-status');
      }
    });
  }

  function boot() {
    injectStyles();
    ensurePanel();
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (ensurePanel() || tries > 30) clearInterval(timer);
    }, 300);
    startFirebase();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
