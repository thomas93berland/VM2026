(()=>{
  let db=null,auth=null,unsub=null,userCache=new Map();
  const MAX_ITEMS=10;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const n=v=>Number(v||0).toLocaleString('nb-NO');
  function init(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return false;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();db=firebase.firestore();return true;
  }
  function styles(){
    if(document.getElementById('recentBetsActivityStyle'))return;
    const s=document.createElement('style');
    s.id='recentBetsActivityStyle';
    s.textContent=`
      #homeActivity.recent-bets-feed{display:grid;gap:8px}
      .recent-bet-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:10px;border-radius:16px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.075)}
      .recent-bet-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(228,184,78,.13);border:1px solid rgba(228,184,78,.25);color:var(--gold);font-weight:1000;font-size:14px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.035)}
      .recent-bet-main{min-width:0;display:grid;gap:3px}
      .recent-bet-main b{color:#fff;font-size:13px;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .recent-bet-main small{color:var(--muted);font-size:11px;font-weight:800;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .recent-bet-side{text-align:right;display:grid;gap:3px;min-width:70px}
      .recent-bet-side b{color:var(--gold);font-size:13px;font-weight:1000}
      .recent-bet-side small{font-size:10px;font-weight:950;color:#9ee7b7;text-transform:uppercase;letter-spacing:.04em}
      .recent-bet-side small.lost{color:#ff9a9a}.recent-bet-side small.active{color:#d7dbe4}
      @media(max-width:520px){.recent-bet-row{grid-template-columns:auto 1fr;gap:9px;padding:9px}.recent-bet-side{grid-column:2;text-align:left;display:flex;gap:8px;align-items:center}.recent-bet-main b{font-size:12.5px}.recent-bet-main small{font-size:10.5px}}
    `;
    document.head.appendChild(s);
  }
  function time(ms){
    const d=new Date(ms||0);
    if(!ms||isNaN(d))return '';
    return d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  }
  function pickText(b){
    const sels=Array.isArray(b.selections)?b.selections:[];
    if(!sels.length)return 'Spill plassert';
    return sels.map(s=>`${s.label||'Valg'} på ${s.title||'kamp'}`).join(' + ');
  }
  function statusClass(status){
    const s=String(status||'').toLowerCase();
    if(s.includes('tapt'))return 'lost';
    if(s.includes('aktiv'))return 'active';
    return '';
  }
  async function namesForMissing(bets){
    const ids=[...new Set(bets.map(b=>b.userId).filter(Boolean).filter(id=>!userCache.has(id)))].slice(0,20);
    await Promise.all(ids.map(async id=>{
      try{const snap=await db.collection('users').doc(id).get();userCache.set(id,snap.exists?(snap.data().name||snap.data().email?.split('@')[0]||'Spiller'):'Spiller')}catch(e){userCache.set(id,'Spiller')}
    }));
  }
  async function renderFromSnapshot(snap){
    const box=document.getElementById('homeActivity');
    if(!box)return;
    box.classList.add('recent-bets-feed');
    const bets=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAtMs||0)-(a.createdAtMs||0)).slice(0,MAX_ITEMS);
    await namesForMissing(bets);
    if(!bets.length){box.innerHTML='<div class="empty">Ingen bets er plassert ennå.</div>';return;}
    box.innerHTML=bets.map(b=>{
      const name=b.userName||userCache.get(b.userId)||'Spiller';
      const initial=(name||'S').trim()[0]?.toUpperCase()||'S';
      const status=b.status||'Aktiv';
      return `<div class="recent-bet-row">
        <div class="recent-bet-icon">${esc(initial)}</div>
        <div class="recent-bet-main"><b>${esc(name)} plasserte et bet</b><small>${esc(pickText(b))} · ${esc(time(b.createdAtMs))}</small></div>
        <div class="recent-bet-side"><b>${n(b.stake)} VM</b><small class="${statusClass(status)}">${esc(status)}</small></div>
      </div>`;
    }).join('');
  }
  function showError(err){
    const box=document.getElementById('homeActivity');
    if(!box)return;
    console.warn('recent bets activity',err);
    box.classList.add('recent-bets-feed');
    box.innerHTML='<div class="empty">Kunne ikke hente nylige bets ennå.</div>';
  }
  function listen(){
    if(unsub){try{unsub()}catch(e){}}
    unsub=db.collection('bets').orderBy('createdAtMs','desc').limit(MAX_ITEMS).onSnapshot(renderFromSnapshot,showError);
  }
  function boot(){
    styles();
    if(!init())return;
    auth.onAuthStateChanged(u=>{
      if(unsub){try{unsub()}catch(e){}}
      if(!u)return;
      listen();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
