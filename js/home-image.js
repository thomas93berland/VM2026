(() => {
  const SETTINGS_COLLECTION = 'siteSettings';
  const SETTINGS_DOC = 'home';
  let db = null;
  let auth = null;
  let currentUser = null;
  let isAdmin = false;
  let wired = false;

  const $ = (id) => document.getElementById(id);

  function toast(message) {
    const el = $('toast');
    if (!el) return alert(message);
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { el.hidden = true; }, 4200);
  }

  function injectStyles() {
    if ($('homeImageStyles')) return;
    const style = document.createElement('style');
    style.id = 'homeImageStyles';
    style.textContent = `
      .home-image-card{overflow:hidden}
      .home-image-frame{
        min-height:220px;
        border-radius:22px;
        border:1px dashed rgba(228,184,78,.34);
        background:
          radial-gradient(circle at 50% 0, rgba(228,184,78,.12), transparent 16rem),
          linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.015));
        display:grid;
        place-items:center;
        overflow:hidden;
        position:relative;
      }
      .home-image-frame img{
        width:100%;
        height:100%;
        min-height:220px;
        object-fit:cover;
        display:block;
      }
      .home-image-placeholder{
        text-align:center;
        padding:28px 18px;
        color:#cdd3de;
      }
      .home-image-placeholder strong{
        display:block;
        color:var(--gold);
        font-size:22px;
        margin-bottom:8px;
      }
      .home-image-placeholder span{color:var(--muted);line-height:1.45}
      .home-image-admin{
        display:none;
        gap:10px;
        flex-wrap:wrap;
        align-items:center;
        margin-top:14px;
      }
      .home-image-admin.show{display:flex}
      .home-image-admin small{color:var(--muted);font-weight:700}
      .home-image-admin input{display:none}
      @media(max-width:560px){
        .home-image-frame{min-height:190px;border-radius:20px}
        .home-image-frame img{min-height:190px}
      }
    `;
    document.head.appendChild(style);
  }

  function findStatsCard() {
    return Array.from(document.querySelectorAll('.card')).find(card => {
      const h2 = card.querySelector('.card-title h2');
      return h2 && h2.textContent.trim().toLowerCase() === 'din statistikk';
    });
  }

  function ensureCard() {
    if ($('homeImageCard')) return true;
    const card = findStatsCard();
    if (!card) return false;
    card.id = 'homeImageCard';
    card.classList.add('home-image-card');
    card.innerHTML = `
      <div class="card-title split">
        <div>
          <span class="nav-icon gold" data-icon="image"></span>
          <h2>Lounge bilde</h2>
        </div>
      </div>
      <div class="home-image-frame" id="homeImageFrame">
        <img id="homeImagePreview" alt="Lounge bilde" hidden>
        <div class="home-image-placeholder" id="homeImagePlaceholder">
          <strong>Admin-bilde</strong>
          <span>Thomas kan laste opp et bilde som vises her på Home.</span>
        </div>
      </div>
      <div class="home-image-admin" id="homeImageAdmin">
        <label class="btn primary compact" for="homeImageInput">Last opp bilde</label>
        <button class="btn secondary compact" id="removeHomeImageBtn" type="button">Fjern bilde</button>
        <small>Anbefalt: liggende bilde. Komprimeres automatisk.</small>
        <input id="homeImageInput" type="file" accept="image/*">
      </div>
    `;
    wireControls();
    updateAdminControls();
    return true;
  }

  function updateAdminControls() {
    const adminBox = $('homeImageAdmin');
    if (adminBox) adminBox.classList.toggle('show', !!isAdmin);
  }

  function setImage(dataUrl) {
    ensureCard();
    const img = $('homeImagePreview');
    const placeholder = $('homeImagePlaceholder');
    if (!img || !placeholder) return;
    if (dataUrl) {
      img.src = dataUrl;
      img.hidden = false;
      placeholder.hidden = true;
    } else {
      img.removeAttribute('src');
      img.hidden = true;
      placeholder.hidden = false;
    }
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) return reject(new Error('Velg en bildefil.'));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Kunne ikke lese bildet.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Kunne ikke åpne bildet.'));
        img.onload = () => {
          const maxW = 1200;
          const maxH = 800;
          const scale = Math.min(1, maxW / img.width, maxH / img.height);
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          let quality = 0.76;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length > 850000 && quality > 0.42) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          if (dataUrl.length > 900000) {
            reject(new Error('Bildet er fortsatt for stort. Velg et mindre bilde.'));
            return;
          }
          resolve(dataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function wireControls() {
    if (wired) return;
    const input = $('homeImageInput');
    const remove = $('removeHomeImageBtn');
    if (!input || !remove) return;
    wired = true;
    input.addEventListener('change', async () => {
      try {
        if (!isAdmin) return toast('Kun admin kan laste opp bilde.');
        const file = input.files && input.files[0];
        if (!file) return;
        toast('Laster opp bilde...');
        const imageData = await compressImage(file);
        await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC).set({
          imageData,
          imageUpdatedBy: currentUser.uid,
          imageUpdatedAtMs: Date.now(),
          imageUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        input.value = '';
        toast('Bilde oppdatert.');
      } catch (e) {
        console.error(e);
        toast((e.code ? e.code + ': ' : '') + (e.message || 'Feil ved opplasting'));
      }
    });
    remove.addEventListener('click', async () => {
      try {
        if (!isAdmin) return toast('Kun admin kan fjerne bilde.');
        await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC).set({
          imageData: '',
          imageUpdatedBy: currentUser.uid,
          imageUpdatedAtMs: Date.now(),
          imageUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        toast('Bilde fjernet.');
      } catch (e) {
        console.error(e);
        toast((e.code ? e.code + ': ' : '') + (e.message || 'Feil ved sletting'));
      }
    });
  }

  function startFirebase() {
    if (!window.firebase || !window.VM_FIREBASE_CONFIG) return;
    if (!firebase.apps.length) firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
    auth.onAuthStateChanged(async (u) => {
      currentUser = u;
      isAdmin = false;
      updateAdminControls();
      if (!u) return;
      try {
        const userDoc = await db.collection('users').doc(u.uid).get();
        isAdmin = userDoc.exists && userDoc.data().isAdmin === true;
        updateAdminControls();
      } catch (e) {
        console.warn('Kunne ikke sjekke admin:', e);
      }
    });
    db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC).onSnapshot((doc) => {
      setImage(doc.exists ? doc.data().imageData : '');
    }, (e) => {
      console.warn('Kunne ikke hente home-bilde:', e);
    });
  }

  function boot() {
    injectStyles();
    ensureCard();
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (ensureCard() || tries > 30) clearInterval(timer);
    }, 300);
    startFirebase();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
