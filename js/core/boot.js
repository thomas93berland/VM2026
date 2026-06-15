(()=>{
  let recentUnsub=null,homeMatchUnsub=null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const fmt=v=>Number(v||0).toLocaleString('nb-NO');

  function addBottomNavIcons(){
    const icons={
      home:'<svg viewBox="0 0 24 24" fill="none"><path d="M3 10.5 12 3l9 7.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 9.5V20h13V9.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      ball:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2"/><path d="M12 7.2 15 9l-1.1 3.2h-3.8L9 9l3-1.8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7.2 13.5 10 17m4-3.5 2.8 3.5M6.3 9.5 9 9m6 0 2.7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      medal:'<svg viewBox="0 0 24 24" fill="none"><path d="M8 3h3l1 4H9L8 3Zm8 0h-3l-1 4h3l1-4Z" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><circle cx="12" cy="14" r="5.2" stroke="currentColor" stroke-width="2.1"/><path d="m12 11.4.8 1.7 1.9.3-1.4 1.3.3 1.9-1.6-.9-1.6.9.3-1.9-1.4-1.3 1.9-.3.8-1.7Z" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round"/></svg>',
      users:'<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="2.1"/><circle cx="16.5" cy="10.5" r="2.5" stroke="currentColor" stroke-width="2.1"/><path d="M4.5 18c.8-2.3 2.9-3.5 4.5-3.5s3.7 1.2 4.5 3.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><path d="M14 18c.5-1.6 2-2.5 3.2-2.5 1 0 2.2.5 3 1.7" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>',
      profile:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="currentColor" stroke-width="2.2"/><path d="M5 19c1.2-3 4-4.5 7-4.5s5.8 1.5 7 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
      chat:'<svg viewBox="0 0 24 24" fill="none"><path d="M5 6.5A4.5 4.5 0 0 1 9.5 2h5A4.5 4.5 0 0 1 19 6.5v4A4.5 4.5 0 0 1 14.5 15H11l-5 4v-4.5A4.5 4.5 0 0 1 5 10.5v-4Z" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><path d="M9 7.5h6M9 11h4" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>',
      knight:'<svg viewBox="0 0 24 24" fill="none"><path d="M7 20h10M8.5 17.5h7L14.5 13l2-2.2-1.7-5.3-5.2 2.2L7 12l2.2 1.1L8.5 17.5Z" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.3 8.3h.1" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'
    };
    if(!document.getElementById('safeBottomNavIconsStyle')){
      const s=document.createElement('style');
      s.id='safeBottomNavIconsStyle';
      s.textContent='.bottom-nav .nav-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important}.bottom-nav .nav-icon svg{width:100%!important;height:100%!important;display:block!important;filter:drop-shadow(0 0 8px rgba(228,184,78,.18))}.bottom-nav .bottom-item.active .nav-icon svg{filter:none!important}';
      document.head.appendChild(s);
    }
    document.querySelectorAll('.bottom-nav .nav-icon[data-icon]').forEach(el=>{
      if(el.dataset.safeSvgDone==='1')return;
      const svg=icons[el.dataset.icon];
      if(svg){el.innerHTML=svg;el.dataset.safeSvgDone='1'}
    });
  }

  function addSafeProfileLayout(){
    const page=document.getElementById('page-profile');
    const card=page?.querySelector('.profile-detail');
    if(!page||!card)return;
    if(!document.getElementById('safeProfileStyle')){
      const s=document.createElement('style');
      s.id='safeProfileStyle';
      s.textContent='.safe-premium-profile{position:relative;overflow:hidden;align-items:flex-start!important;padding:22px!important;border-radius:28px!important;background:linear-gradient(145deg,rgba(9,18,34,.96),rgba(4,10,22,.98))!important;border:1px solid rgba(228,184,78,.28)!important;box-shadow:0 22px 45px rgba(0,0,0,.28),inset 0 0 0 1px rgba(255,255,255,.035)!important}.safe-premium-profile:before{content:"";position:absolute;inset:-45% -25% auto auto;width:190px;height:190px;border-radius:999px;background:radial-gradient(circle,rgba(228,184,78,.18),transparent 68%);pointer-events:none}.safe-premium-profile .avatar.large{width:82px!important;height:82px!important;border-radius:999px!important;border:2px solid rgba(228,184,78,.72)!important;box-shadow:0 0 0 6px rgba(228,184,78,.10),0 14px 30px rgba(0,0,0,.35)!important;background:linear-gradient(145deg,#2a2418,#0d1424)!important;color:var(--gold)!important;font-size:34px!important;font-weight:950!important}.safe-premium-profile small{display:block!important;color:rgba(228,184,78,.9)!important;text-transform:uppercase!important;letter-spacing:.18em!important;font-size:11px!important;font-weight:950!important}.safe-premium-profile h1{margin:2px 0 0!important;font-size:50px!important;line-height:.94!important;letter-spacing:-.055em!important;color:var(--gold)!important;text-shadow:0 0 22px rgba(228,184,78,.22)!important;font-family:Georgia,"Times New Roman",serif!important}.safe-premium-profile .safe-rank{display:inline-flex!important;margin-top:11px!important;padding:8px 13px!important;border-radius:999px!important;background:rgba(228,184,78,.12)!important;border:1px solid rgba(228,184,78,.27)!important;color:#fff!important;font-weight:950!important;font-size:15px!important}.safe-premium-profile .btn{position:absolute!important;right:16px!important;bottom:16px!important}.safe-profile-subtitle{margin-top:6px!important;color:var(--muted)!important;font-size:12px!important}@media(max-width:520px){.safe-premium-profile{gap:14px!important;padding:18px!important}.safe-premium-profile .avatar.large{width:72px!important;height:72px!important}.safe-premium-profile h1{font-size:42px!important}.safe-premium-profile .btn{position:static!important;margin-left:0!important;margin-top:12px!important;width:100%!important}}';
      document.head.appendChild(s);
    }
    card.classList.add('safe-premium-profile');
    const label=card.querySelector('small');
    const name=card.querySelector('[data-bind="name"]');
    const p=card.querySelector('p');
    if(label)label.textContent='NAVN';
    if(name)name.textContent='Thomas';
    if(p){p.className='safe-profile-subtitle';p.innerHTML='<span class="safe-rank">Legende ⭐</span><br>VM-tipster • Chess Lounge member';}
  }

  function pickText(b){
    const sels=Array.isArray(b.selections)?b.selections:[];
    if(!sels.length)return 'Spill plassert';
    return sels.map(s=>(s.label||'Valg')+' på '+(s.title||'kamp')).join(' + ');
  }

  function when(ms){
    const d=new Date(ms||0);
    if(!ms||isNaN(d))return '';
    return d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  }

  function matchTime(v){
    const d=new Date(v||0);
    if(!v||isNaN(d))return '-';
    return d.toLocaleString('nb-NO',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  }

  function addHomeMatchWidget(){
    const home=document.getElementById('page-home');
    if(!home||home.dataset.matchWidgetBooted==='1')return;
    if(!window.firebase||!firebase.firestore)return;
    home.dataset.matchWidgetBooted='1';
    if(!document.getElementById('safeHomeMatchStyle')){
      const s=document.createElement('style');
      s.id='safeHomeMatchStyle';
      s.textContent='.home-match-widget{margin:0 0 14px;padding:14px;border-radius:20px;background:linear-gradient(135deg,rgba(228,184,78,.14),rgba(5,13,27,.82));border:1px solid rgba(228,184,78,.23);box-shadow:0 14px 30px rgba(0,0,0,.18)}.home-match-widget small{color:var(--gold);font-weight:950;text-transform:uppercase;letter-spacing:.08em}.home-match-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px}.home-match-teams{min-width:0}.home-match-teams b{display:block;color:#fff;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.home-match-teams span{display:block;color:var(--muted);font-size:12px;margin-top:3px}.home-match-badge{padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.09);color:#fff;font-size:12px;font-weight:950;white-space:nowrap}.home-match-badge.live{background:rgba(54,211,153,.13);border-color:rgba(54,211,153,.25);color:#9ee7b7}@media(max-width:520px){.home-match-row{align-items:flex-start}.home-match-badge{font-size:11px}}';
      document.head.appendChild(s);
    }
    const widget=document.createElement('article');
    widget.className='home-match-widget';
    widget.id='homeMatchWidget';
    widget.innerHTML='<small>Neste kamp</small><div class="home-match-row"><div class="home-match-teams"><b>Laster kamp...</b><span>Henter VM-program</span></div><div class="home-match-badge">VM 2026</div></div>';
    const first=home.firstElementChild;
    home.insertBefore(widget,first);
    const db=firebase.firestore();
    try{
      if(homeMatchUnsub)homeMatchUnsub();
      homeMatchUnsub=db.collection('matches').onSnapshot(snap=>{
        const now=Date.now();
        const matches=snap.docs.map(d=>({id:d.id,...d.data()}));
        const open=matches.filter(m=>!m.result).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
        const live=open.find(m=>{const t=new Date(m.time||0).getTime();return t&&now>=t&&now<t+130*60*1000;});
        const next=live||open.find(m=>new Date(m.time||0).getTime()>=now)||open[0];
        if(!next){widget.innerHTML='<small>Neste kamp</small><div class="home-match-row"><div class="home-match-teams"><b>Ingen åpne kamper</b><span>Thomas/admin kan legge inn kamper</span></div><div class="home-match-badge">Tomt</div></div>';return;}
        const isLive=!!live;
        widget.innerHTML='<small>'+(isLive?'Live nå':'Neste kamp')+'</small><div class="home-match-row"><div class="home-match-teams"><b>'+esc(next.home||'Hjemme')+' – '+esc(next.away||'Borte')+'</b><span>'+esc(next.group||'VM 2026')+' · '+esc(matchTime(next.time))+'</span></div><div class="home-match-badge '+(isLive?'live':'')+'">'+(isLive?'LIVE':'KOMMENDE')+'</div></div>';
      },err=>{console.warn('home match widget',err);});
    }catch(e){console.warn('home match widget start',e);}
  }

  function addRecentBetsFeed(){
    const box=document.getElementById('homeActivity');
    if(!box||box.dataset.recentBooted==='1')return;
    if(!window.firebase||!firebase.firestore)return;
    const db=firebase.firestore();
    box.dataset.recentBooted='1';
    if(!document.getElementById('safeRecentBetsStyle')){
      const s=document.createElement('style');
      s.id='safeRecentBetsStyle';
      s.textContent='#homeActivity.recent-bets-feed{display:grid;gap:8px}.recent-bet-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:10px;border-radius:16px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.075)}.recent-bet-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(228,184,78,.13);border:1px solid rgba(228,184,78,.25);color:var(--gold);font-weight:1000;font-size:14px}.recent-bet-main{min-width:0;display:grid;gap:3px}.recent-bet-main b{color:#fff;font-size:13px;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.recent-bet-main small{color:var(--muted);font-size:11px;font-weight:800;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.recent-bet-side{text-align:right;display:grid;gap:3px;min-width:70px}.recent-bet-side b{color:var(--gold);font-size:13px;font-weight:1000}.recent-bet-side small{font-size:10px;font-weight:950;color:#9ee7b7;text-transform:uppercase;letter-spacing:.04em}.recent-bet-side small.lost{color:#ff9a9a}.recent-bet-side small.active{color:#d7dbe4}';
      document.head.appendChild(s);
    }
    box.classList.add('recent-bets-feed');
    try{
      if(recentUnsub)recentUnsub();
      recentUnsub=db.collection('bets').orderBy('createdAtMs','desc').limit(10).onSnapshot(snap=>{
        const bets=snap.docs.map(d=>({id:d.id,...d.data()}));
        if(!bets.length){box.innerHTML='<div class="empty">Ingen bets er plassert ennå.</div>';return;}
        box.innerHTML=bets.map(b=>{
          const name=b.userName||'Spiller';
          const initial=(name.trim()[0]||'S').toUpperCase();
          const status=b.status||'Aktiv';
          const cls=String(status).toLowerCase().includes('tapt')?'lost':String(status).toLowerCase().includes('aktiv')?'active':'';
          return '<div class="recent-bet-row"><div class="recent-bet-icon">'+esc(initial)+'</div><div class="recent-bet-main"><b>'+esc(name)+' plasserte et bet</b><small>'+esc(pickText(b))+' · '+esc(when(b.createdAtMs))+'</small></div><div class="recent-bet-side"><b>'+fmt(b.stake)+' VM</b><small class="'+cls+'">'+esc(status)+'</small></div></div>';
        }).join('');
      },err=>{console.warn('recent bets',err);box.innerHTML='<div class="empty">Kunne ikke hente nylige bets ennå.</div>';});
    }catch(e){console.warn('recent bets start',e);}
  }

  function onReady(){
    const run=()=>{
      addBottomNavIcons();
      addSafeProfileLayout();
      addHomeMatchWidget();
      addRecentBetsFeed();
      setTimeout(addBottomNavIcons,500);
      setTimeout(addSafeProfileLayout,650);
      setTimeout(addHomeMatchWidget,700);
      setTimeout(addRecentBetsFeed,900);
    };
    if(window.firebase&&firebase.auth){firebase.auth().onAuthStateChanged(user=>{if(user)run();});}
    document.addEventListener('click',e=>{if(e.target.closest?.('[data-page]'))setTimeout(run,250);});
  }

  window.VM_SAFE_BOOT={startAll:()=>{addBottomNavIcons();addSafeProfileLayout();addHomeMatchWidget();addRecentBetsFeed();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',onReady);else onReady();
})();
