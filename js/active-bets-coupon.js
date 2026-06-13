(()=>{
  let db=null,auth=null,unsub=null;
  const money=n=>Number(n||0).toLocaleString('nb-NO');
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function initFirebase(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return false;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();
    db=firebase.firestore();
    return true;
  }
  function injectStyles(){
    if(document.getElementById('activeBetsCouponStyles'))return;
    const s=document.createElement('style');
    s.id='activeBetsCouponStyles';
    s.textContent=`
      .active-coupons-card{border-color:rgba(228,184,78,.18)!important;background:linear-gradient(145deg,rgba(10,26,47,.88),rgba(4,10,19,.94))!important}
      .active-coupon-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
      .active-coupon-head small{display:block;color:var(--gold);font-weight:900;text-transform:uppercase;letter-spacing:.08em}
      .active-coupon-head h2{margin:3px 0 0;font-size:20px;letter-spacing:-.035em}
      .active-coupon-count{min-width:34px;height:34px;border-radius:14px;display:grid;place-items:center;background:rgba(228,184,78,.13);border:1px solid rgba(228,184,78,.26);color:var(--gold);font-weight:950}
      .active-coupon-list{display:grid;gap:11px}
      .active-coupon{position:relative;overflow:hidden;border-radius:20px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);padding:13px}
      .active-coupon:before,.active-coupon:after{content:"";position:absolute;top:50%;width:18px;height:18px;border-radius:50%;background:var(--bg-2);border:1px solid rgba(255,255,255,.08)}
      .active-coupon:before{left:-10px}.active-coupon:after{right:-10px}
      .active-coupon-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}
      .active-coupon-title{font-weight:950;color:var(--text)}
      .active-coupon-status{font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.08em;color:#171004;background:linear-gradient(180deg,#f2c96a,#cf982e);border-radius:999px;padding:5px 8px;white-space:nowrap}
      .active-coupon-picks{display:grid;gap:7px;border-top:1px dashed rgba(255,255,255,.13);border-bottom:1px dashed rgba(255,255,255,.13);padding:10px 0;margin:0 0 10px}
      .active-coupon-pick{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}
      .active-coupon-pick b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px}
      .active-coupon-pick small{display:block;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px}
      .active-coupon-odd{color:var(--gold);font-weight:950;font-size:15px}
      .active-coupon-footer{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
      .active-coupon-footer div{border-radius:14px;background:rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.055);padding:8px;text-align:center}
      .active-coupon-footer small{display:block;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:850}
      .active-coupon-footer b{display:block;margin-top:3px;color:var(--text);font-size:14px}
      .active-coupon-footer .win b{color:var(--green)}
      .active-coupon-empty{padding:14px;border-radius:18px;background:rgba(255,255,255,.03);border:1px dashed rgba(255,255,255,.10);color:var(--muted);text-align:center;font-weight:750}
      @media(max-width:520px){.active-coupon-footer{grid-template-columns:1fr 1fr 1fr}.active-coupon-footer div{padding:7px 4px}.active-coupon-footer b{font-size:13px}.active-coupon-head h2{font-size:18px}}
    `;
    document.head.appendChild(s);
  }
  function ensureBox(){
    const page=document.getElementById('page-betting');
    if(!page)return null;
    let card=document.getElementById('activeBetsCouponCard');
    if(card)return card;
    card=document.createElement('article');
    card.id='activeBetsCouponCard';
    card.className='card active-coupons-card';
    const rules=page.querySelector('.rules-card');
    if(rules&&rules.parentNode)rules.parentNode.insertBefore(card,rules.nextSibling);
    else page.appendChild(card);
    return card;
  }
  function render(bets=[]){
    injectStyles();
    const card=ensureBox();
    if(!card)return;
    const active=bets.filter(b=>String(b.status||'').toLowerCase()==='aktiv');
    const totalStake=active.reduce((a,b)=>a+Number(b.stake||0),0);
    const totalWin=active.reduce((a,b)=>a+Number(b.possibleWin||0),0);
    const list=active.length?active.map((b,i)=>{
      const picks=(b.selections||[]).map(s=>`<div class="active-coupon-pick"><div><b>${esc(s.label||'Valg')}</b><small>${esc(s.title||'Kamp')}</small></div><span class="active-coupon-odd">${Number(s.odds||1).toFixed(2)}</span></div>`).join('');
      return `<section class="active-coupon"><div class="active-coupon-top"><span class="active-coupon-title">Kupong #${i+1}</span><span class="active-coupon-status">Aktiv</span></div><div class="active-coupon-picks">${picks}</div><div class="active-coupon-footer"><div><small>Innsats</small><b>${money(b.stake)}</b></div><div><small>Total odds</small><b>${Number(b.totalOdds||1).toFixed(2)}</b></div><div class="win"><small>Mulig</small><b>${money(b.possibleWin)}</b></div></div></section>`;
    }).join(''):'<div class="active-coupon-empty">Ingen aktive kuponger ennå.</div>';
    card.innerHTML=`<div class="active-coupon-head"><div><small>Mine spill</small><h2>Aktive kuponger</h2></div><span class="active-coupon-count">${active.length}</span></div><div class="active-coupon-list">${list}</div>${active.length?`<div class="active-coupon-footer" style="margin-top:11px"><div><small>Total innsats</small><b>${money(totalStake)}</b></div><div><small>Kuponger</small><b>${active.length}</b></div><div class="win"><small>Maks mulig</small><b>${money(totalWin)}</b></div></div>`:''}`;
  }
  function listen(uid){
    if(unsub){try{unsub()}catch{}}
    unsub=db.collection('bets').where('userId','==',uid).onSnapshot(s=>{
      const bets=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAtMs||0)-(a.createdAtMs||0));
      render(bets);
    },()=>render([]));
  }
  function boot(){
    if(!initFirebase())return;
    injectStyles();
    ensureBox();
    auth.onAuthStateChanged(u=>{if(!u){render([]);return}listen(u.uid)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
