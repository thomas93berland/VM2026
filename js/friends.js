(()=>{
  let db=null,auth=null,me=null,users=[],friendIds=[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function init(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return false;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();db=firebase.firestore();return true;
  }
  function css(){
    if(document.getElementById('friendsStyle'))return;
    const s=document.createElement('style');
    s.id='friendsStyle';
    s.textContent=`
      .friends-card{margin-top:14px;padding:14px!important;border-radius:22px!important;background:linear-gradient(145deg,rgba(9,24,45,.84),rgba(3,9,18,.92))!important;border:1px solid rgba(228,184,78,.16)!important}
      .friends-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      .friends-head h3{margin:0;font-size:18px;letter-spacing:-.035em}.friends-head small{color:var(--gold);font-weight:900;text-transform:uppercase;letter-spacing:.07em}
      .friends-search{display:flex;gap:8px;margin-bottom:10px}.friends-search input{flex:1;min-width:0;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.045);color:var(--text);padding:11px 12px;font-weight:800}.friends-search button{border-radius:14px;border:1px solid rgba(228,184,78,.26);background:rgba(228,184,78,.13);color:var(--gold);font-weight:950;padding:0 13px}
      .friends-list,.friends-results{display:grid;gap:7px}.friend-row{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:9px;align-items:center;padding:9px;border-radius:15px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.032)}
      .friend-avatar{width:38px;height:38px;border-radius:14px;display:grid;place-items:center;background:rgba(228,184,78,.14);color:var(--gold);font-weight:950;overflow:hidden}.friend-avatar img{width:100%;height:100%;object-fit:cover}
      .friend-name{font-weight:950;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.friend-meta{font-size:11px;color:var(--muted);font-weight:750;margin-top:2px}.friend-actions{display:flex;gap:6px}.friend-actions button{border:0;border-radius:12px;padding:8px 9px;font-size:11px;font-weight:950}.friend-add{background:linear-gradient(180deg,#f2c96a,#cf982e);color:#171004}.friend-open{background:rgba(255,255,255,.07);color:var(--text)}.friend-remove{background:rgba(235,80,80,.12);color:#ff8b8b}.friends-empty{padding:10px;border:1px dashed rgba(255,255,255,.12);border-radius:14px;color:var(--muted);font-size:12px;text-align:center;font-weight:800}
    `;
    document.head.appendChild(s);
  }
  function avatar(u){return u.photoData?`<img src="${u.photoData}" alt="">`:esc((u.name||u.displayName||u.email||'?').slice(0,1).toUpperCase())}
  function profileText(u){return `VM Coins: ${Number(u.coins||0).toLocaleString('nb-NO')} · Rating: ${u.gamblingRating||u.elo||500}`}
  function place(host){
    const profile=document.getElementById('page-profile')||document.querySelector('.page.active')||document.querySelector('.main');
    const stats=profile?.querySelector('.profile-stats');
    if(stats&&stats.parentNode){stats.parentNode.insertBefore(host,stats.nextSibling);return}
    const card=profile?.querySelector('.profile-card,.card:last-child');
    if(card&&card.parentNode)card.parentNode.insertBefore(host,card.nextSibling);else profile?.appendChild(host);
  }
  function ensureCard(){
    css();
    let host=document.getElementById('friendsCard');
    if(host){place(host);return host;}
    host=document.createElement('article');host.id='friendsCard';host.className='card friends-card';
    host.innerHTML=`<div class="friends-head"><div><small>Community</small><h3>Venner</h3></div><span id="friendsCount">0</span></div><div class="friends-search"><input id="friendsSearchInput" placeholder="Søk etter bruker"><button id="friendsSearchBtn" type="button">Søk</button></div><div id="friendsResults" class="friends-results"></div><div style="height:10px"></div><div id="friendsList" class="friends-list"></div>`;
    place(host);
    host.querySelector('#friendsSearchBtn').addEventListener('click',search);
    host.querySelector('#friendsSearchInput').addEventListener('input',()=>search(false));
    host.addEventListener('click',onClick);
    return host;
  }
  async function loadUsers(){
    const snap=await db.collection('users').get();users=snap.docs.map(d=>({id:d.id,...d.data()}));
  }
  async function loadFriends(){
    const doc=await db.collection('users').doc(me.uid).get();friendIds=doc.data()?.friends||[];
  }
  function search(showEmpty=true){
    const q=document.getElementById('friendsSearchInput')?.value.trim().toLowerCase()||'';
    const box=document.getElementById('friendsResults');if(!box)return;
    if(!q){box.innerHTML='';return}
    const res=users.filter(u=>u.id!==me.uid&&!friendIds.includes(u.id)&&String(u.name||u.displayName||u.email||'').toLowerCase().includes(q)).slice(0,8);
    box.innerHTML=res.length?res.map(row).join(''):(showEmpty?'<div class="friends-empty">Fant ingen brukere.</div>':'');
  }
  function row(u,isFriend=false){return `<div class="friend-row" data-uid="${esc(u.id)}"><div class="friend-avatar">${avatar(u)}</div><div><div class="friend-name">${esc(u.name||u.displayName||u.email||'Ukjent')}</div><div class="friend-meta">${esc(profileText(u))}</div></div><div class="friend-actions"><button class="friend-open" data-act="open">Profil</button>${isFriend?'<button class="friend-remove" data-act="remove">Fjern</button>':'<button class="friend-add" data-act="add">Legg til</button>'}</div></div>`}
  function renderFriends(){
    const list=document.getElementById('friendsList');const count=document.getElementById('friendsCount');if(!list)return;
    const friends=friendIds.map(id=>users.find(u=>u.id===id)).filter(Boolean);
    if(count)count.textContent=friends.length;
    list.innerHTML=friends.length?friends.map(u=>row(u,true)).join(''):'<div class="friends-empty">Ingen venner lagt til ennå.</div>';
  }
  async function onClick(e){
    const btn=e.target.closest('button[data-act]');if(!btn)return;
    const row=btn.closest('.friend-row');const uid=row?.dataset.uid;if(!uid)return;
    if(btn.dataset.act==='add'){
      if(!friendIds.includes(uid))friendIds.push(uid);
      await db.collection('users').doc(me.uid).set({friends:friendIds},{merge:true});
      renderFriends();search(false);
    }
    if(btn.dataset.act==='remove'){
      friendIds=friendIds.filter(x=>x!==uid);
      await db.collection('users').doc(me.uid).set({friends:friendIds},{merge:true});
      renderFriends();search(false);
    }
    if(btn.dataset.act==='open'){
      row.click();
      const u=users.find(x=>x.id===uid);alert(`${u?.name||u?.displayName||'Profil'}\n${profileText(u||{})}`);
    }
  }
  async function refresh(){ensureCard();if(!me)return;await loadUsers();await loadFriends();renderFriends()}
  function boot(){if(!init())return;ensureCard();auth.onAuthStateChanged(u=>{me=u;if(u)refresh()});setInterval(()=>{if(me)refresh()},15000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();