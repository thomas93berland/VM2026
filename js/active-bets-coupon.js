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
    const old=document.getElementById('activeBetsCouponStyles');
    if(old)old.remove();
    const s=document.createElement('style');
    s.id='activeBetsCouponStyles';
    s.textContent=`
      .active-coupons-card{padding:12px!important;border-radius:20px!important;margin-top:12px!important;border-color:rgba(228,184,78,.16)!important;background:linear-gradient(145deg,rgba(10,26,47,.72),rgba(4,10,19,.86))!important}
      .active-coupon-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
      .active-coupon-head small{display:block;color:var(--gold);font-weight:900;text-transform:uppercase;letter-spacing:.08em;font-size:10px}
      .active-coupon-head h2{margin:2px 0 0;font-size:16px;letter-spacing:-.035em}
      .active-coupon-count{min-width:28px;height:28px;border-radius:11px;display:grid;place-items:center;background:rgba(228,184,78,.13);border:1px solid rgba(228,184,78,.24);color:var(--gold);font-weight:950;font-size:13px}
      .active-coupon-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px}
      .active-coupon-summary div{border-radius:12px;background:rgba(0,0,0,.16);border:1px solid rgba(255,255,255,.055);padding:7px 6px;text-align:center}
      .active-coupon-summary small{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.055em;font-weight:850;line-height:1}
      .active-coupon-summary b{display:block;margin-top:3px;color:var(--text);font-size:12px;line-height:1}
      .active-coupon-summary .win b{color:var(--green)}
      .active-coupon-list{display:grid;gap:7px}
      .active-coupon{position:relative;overflow:hidden;border-radius:15px;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.028)}
      .active-coupon>summary{list-style:none;cursor:pointer;padding:9px 10px;display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center}
      .active-coupon>summary::-webkit-details-marker{display:none}
      .active-coupon-title{font-weight:950;color:var(--text);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .active-coupon-mini{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:11px;font-weight:850;white-space:nowrap}
      .active-coupon-mini b{color:var(--gold);font-size:13px}
      .active-coupon-status{font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.07em;color:#171004;background:linear-gradient(180deg,#f2c96a,#cf982e);border-radius:999px;padding:4px 7px;white-space:nowrap}
      .active-coupon-chevron{color:var(--gold);font-size:18px;line-height:1;transition:transform .14s ease}
      .active-coupon[open] .active-coupon-chevron{transform:rotate(90deg)}
      .active-coupon-body{padding:0 10px 10px}
      .active-coupon-picks{display:grid;gap:5px;border-top:1px dashed rgba(255,255,255,.12);padding:8px 0 0;margin:0 0 8px}
      .active-coupon-pick{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}
      .active-coupon-pick b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;line-height:1.15}
      .active-coupon-pick small{display:block;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10px;line-height:1.1}
      .active-coupon-odd{color:var(--gold);font-weight:950;font-size:13px}
      .active-coupon-footer{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
      .active-coupon-footer div{border-radius:12px;background:rgba(0,0,0,.16);border:1px solid rgba(255,255,255,.052);padding:6px 5px;text-align:center}
      .active-coupon-footer small{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.055em;font-weight:850;line-height:1}
      .active-coupon-footer b{display:block;margin-top:3px;color:var(--text);font-size:12px;line-height:1}
      .active-coupon-footer .win b{color:var(--green)}
      .active-coupon-empty{padding:10px;border-radius:14px;background:rgba(255,255,255,.03);border:1px dashed rgba(255,255,255,.10);color:var(--muted);text-align:center;font-weight:750;font-size:12px}
      @media(max-width:520px){.active-coupons-card{padding:10px!important}.active-coupon-head h2{font-size:15px}.active-coupon-summary div{padding:6px 4px}.active-coupon>summary{grid-template-columns:minmax(0,1fr) auto 16px;padding:8px 9px}.active-coupon-status{display:none}.active-coupon-mini{font-size:10px;gap:5px}.active-coupon-mini b{font-size:12px}.active-coupon-footer b,.active-coupon-summary b{font-size:11px}}
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
      const selections=b.selections||[];
      const first=selections[0]||{};
      const title=selections.length>1?`${selections.length} valg`:(first.label||'Valg');
      const picks=selections.map(s=>`<div class="active-coupon-pick"><div><b>${esc(s.label||'Valg')}</b><small>${esc(s.title||'Kamp')}</small></div><span class="active-coupon-odd">${Number(s.odds||1).toFixed(2)}</span></div>`).join('');
      return `<details class="active-coupon"><summary><span class="active-coupon-title">Kupong #${i+1} · ${esc(title)}</span><span class="active-coupon-mini"><span>${money(b.stake)}</span><b>${Number(b.totalOdds||1).toFixed(2)}</b></span><span class="active-coupon-chevron">›</span><span class="active-coupon-status">Aktiv</span></summary><div class="active-coupon-body"><div class="active-coupon-picks">${picks}</div><div class="active-coupon-footer"><div><small>Innsats</small><b>${money(b.stake)}</b></div><div><small>Odds</small><b>${Number(b.totalOdds||1).toFixed(2)}</b></div><div class="win"><small>Mulig</small><b>${money(b.possibleWin)}</b></div></div></div></details>`;
    }).join(''):'<div class="active-coupon-empty">Ingen aktive kuponger ennå.</div>';
    card.innerHTML=`<div class="active-coupon-head"><div><small>Mine spill</small><h2>Aktive kuponger</h2></div><span class="active-coupon-count">${active.length}</span></div>${active.length?`<div class="active-coupon-summary"><div><small>Innsats</small><b>${money(totalStake)}</b></div><div><small>Kuponger</small><b>${active.length}</b></div><div class="win"><small>Mulig</small><b>${money(totalWin)}</b></div></div>`:''}<div class="active-coupon-list">${list}</div>`;
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
