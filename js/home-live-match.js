(()=>{
  let db=null,auth=null,unsub=null,matches=[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const when=v=>{let d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'-'};
  const diff=v=>{let d=new Date(v),ms=d-Date.now();if(!v||isNaN(d))return 'Tid ikke satt';if(ms<=0)return 'Pågår nå';let h=Math.floor(ms/36e5),m=Math.floor((ms%36e5)/6e4);return h>0?`Starter om ${h}t ${m}m`:`Starter om ${m}m`};
  function initFirebase(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return false;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();db=firebase.firestore();return true;
  }
  function injectStyles(){
    const old=document.getElementById('homeLiveMatchStyles');
    if(old)old.remove();
    const s=document.createElement('style');
    s.id='homeLiveMatchStyles';
    s.textContent=`
      .search{display:none!important}
      .home-live-match{margin:10px 0 16px;border-radius:24px;border:1px solid rgba(228,184,78,.22);background:linear-gradient(145deg,rgba(11,29,52,.96),rgba(4,10,19,.96));padding:14px;position:relative;overflow:hidden;box-shadow:0 18px 45px rgba(0,0,0,.20)}
      .home-live-match:before{content:"";position:absolute;right:-42px;top:-48px;width:132px;height:132px;border-radius:50%;background:radial-gradient(circle,rgba(228,184,78,.22),transparent 68%)}
      .home-live-top{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      .home-live-label{display:inline-flex;align-items:center;gap:7px;min-height:27px;padding:0 10px;border-radius:999px;background:rgba(235,80,80,.13);border:1px solid rgba(235,80,80,.32);color:#ff7777;font-size:11px;font-weight:950;text-transform:uppercase;letter-spacing:.08em}
      .home-live-label.next{background:rgba(228,184,78,.12);border-color:rgba(228,184,78,.26);color:var(--gold)}
      .home-live-pulse{width:7px;height:7px;border-radius:50%;background:#ff5757;box-shadow:0 0 0 5px rgba(255,87,87,.12)}
      .home-live-label.next .home-live-pulse{background:var(--gold);box-shadow:0 0 0 5px rgba(228,184,78,.12)}
      .home-live-time{color:#d7dbe4;font-size:12px;font-weight:850;text-align:right}
      .home-live-teams{position:relative;z-index:1;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px;margin:8px 0 10px}
      .home-live-team{min-width:0;border-radius:18px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.075);padding:11px 10px;font-weight:950;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .home-live-team:last-child{text-align:right}
      .home-live-vs{width:35px;height:35px;border-radius:50%;display:grid;place-items:center;background:rgba(228,184,78,.12);border:1px solid rgba(228,184,78,.24);color:var(--gold);font-weight:950;font-size:11px}
      .home-live-meta{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;color:var(--muted);font-size:12px;font-weight:800}
      .home-live-meta b{color:var(--gold)}
      .home-live-action{color:var(--gold);font-weight:950;background:none;border:0;padding:0;font-size:12px}
      body:not(.home-active) .home-live-match{display:none!important}
      @media(max-width:520px){.home-live-match{margin:8px 0 14px;padding:12px;border-radius:22px}.home-live-teams{grid-template-columns:1fr;gap:7px}.home-live-vs{width:100%;height:25px;border-radius:12px}.home-live-team:last-child{text-align:left}.home-live-team{font-size:15px;padding:10px}.home-live-meta{font-size:11px}.home-live-time{font-size:11px}}
    `;
    document.head.appendChild(s);
  }
  function ensureCard(){
    let c=document.getElementById('homeLiveMatchCard');
    if(c)return c;
    c=document.createElement('section');
    c.id='homeLiveMatchCard';
    c.className='home-live-match';
    const search=document.querySelector('.search');
    if(search&&search.parentNode)search.parentNode.insertBefore(c,search.nextSibling);
    else document.querySelector('.main')?.prepend(c);
    c.addEventListener('click',e=>{if(e.target.closest('button')||e.currentTarget===e.target){document.querySelector('[data-page="betting"]')?.click();}});
    return c;
  }
  function pickMatch(){
    const now=Date.now();
    const open=matches.filter(m=>!m.result&&m.time).sort((a,b)=>new Date(a.time)-new Date(b.time));
    const live=open.find(m=>{const t=new Date(m.time).getTime();return t<=now&&now<=t+115*60000});
    return {match:live||open[0]||matches.find(m=>!m.result)||null,isLive:!!live};
  }
  function renderCard(){
    injectStyles();
    const c=ensureCard();
    document.body.classList.toggle('home-active',document.getElementById('page-home')?.classList.contains('active'));
    const {match:m,isLive}=pickMatch();
    if(!m){c.innerHTML=`<div class="home-live-top"><span class="home-live-label next"><i class="home-live-pulse"></i> Ingen kamp</span><span class="home-live-time">Betting</span></div><div class="home-live-meta"><span>Ingen kommende kamper er lagt inn ennå.</span><button class="home-live-action" type="button">Gå til betting ›</button></div>`;return;}
    const label=isLive?'LIVE NÅ':'NESTE KAMP';
    c.innerHTML=`
      <div class="home-live-top">
        <span class="home-live-label ${isLive?'':'next'}"><i class="home-live-pulse"></i>${label}</span>
        <span class="home-live-time">${esc(diff(m.time))}</span>
      </div>
      <div class="home-live-teams">
        <div class="home-live-team">${esc(m.home||'Hjemme')}</div>
        <div class="home-live-vs">VS</div>
        <div class="home-live-team">${esc(m.away||'Borte')}</div>
      </div>
      <div class="home-live-meta"><span><b>${esc(m.group||'VM 2026')}</b> · ${esc(when(m.time))}</span><button class="home-live-action" type="button">Bet nå ›</button></div>
    `;
  }
  function bindNavWatcher(){
    document.addEventListener('click',e=>{if(e.target.closest('[data-page],[data-go]'))setTimeout(renderCard,80)});
    setInterval(renderCard,2000);
  }
  function boot(){
    injectStyles();ensureCard();bindNavWatcher();renderCard();
    if(!initFirebase())return;
    auth.onAuthStateChanged(u=>{
      if(unsub){try{unsub()}catch{}}
      if(!u){matches=[];renderCard();return;}
      unsub=db.collection('matches').onSnapshot(s=>{matches=s.docs.map(d=>({id:d.id,...d.data()}));renderCard();},()=>renderCard());
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
