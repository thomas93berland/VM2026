(()=>{
  if(window.VM_UPCOMING_MATCH_SEED_LOADED)return;
  window.VM_UPCOMING_MATCH_SEED_LOADED=true;

  const BATCH_SIZE=4;
  const fixtures=[
    {id:'wc2026-sui-dza-r32-2026-07-03',home:'Sveits',away:'Algerie',time:'2026-07-03T03:00:00Z',group:'Round of 32',odds:{home:2.20,draw:3.20,away:3.10}},
    {id:'wc2026-aus-egy-r32-2026-07-03',home:'Australia',away:'Egypt',time:'2026-07-03T18:00:00Z',group:'Round of 32',odds:{home:2.85,draw:3.15,away:2.35}},
    {id:'wc2026-arg-cpv-r32-2026-07-03',home:'Argentina',away:'Kapp Verde',time:'2026-07-03T22:00:00Z',group:'Round of 32',odds:{home:1.38,draw:4.80,away:7.40}},
    {id:'wc2026-col-gha-r32-2026-07-04',home:'Colombia',away:'Ghana',time:'2026-07-04T01:30:00Z',group:'Round of 32',odds:{home:2.05,draw:3.25,away:3.35}},
    {id:'wc2026-can-mar-r16-2026-07-04',home:'Canada',away:'Marokko',time:'2026-07-04T17:00:00Z',group:'Round of 16',odds:{home:2.65,draw:3.10,away:2.55}},
    {id:'wc2026-par-fra-r16-2026-07-04',home:'Paraguay',away:'Frankrike',time:'2026-07-04T21:00:00Z',group:'Round of 16',odds:{home:5.60,draw:3.95,away:1.52}},
    {id:'wc2026-bra-nor-r16-2026-07-05',home:'Brasil',away:'Norge',time:'2026-07-05T20:00:00Z',group:'Round of 16',odds:{home:1.70,draw:3.70,away:4.60}},
    {id:'wc2026-mex-eng-r16-2026-07-06',home:'Mexico',away:'England',time:'2026-07-06T00:00:00Z',group:'Round of 16',odds:{home:3.30,draw:3.20,away:2.10}},
    {id:'wc2026-tbd-esp-r16-2026-07-06',home:'Portugal/Kroatia-vinner',away:'Spania',time:'2026-07-06T19:00:00Z',group:'Round of 16',odds:{home:3.10,draw:3.25,away:2.15}},
    {id:'wc2026-usa-bel-r16-2026-07-07',home:'USA',away:'Belgia',time:'2026-07-07T00:00:00Z',group:'Round of 16',odds:{home:2.55,draw:3.25,away:2.55}},
    {id:'wc2026-r32-21-r16-2026-07-07',home:'Vinner Argentina/Kapp Verde',away:'Vinner Australia/Egypt',time:'2026-07-07T16:00:00Z',group:'Round of 16',odds:{home:2.00,draw:3.20,away:3.55}},
    {id:'wc2026-r32-23-r16-2026-07-07',home:'Vinner Sveits/Algerie',away:'Vinner Colombia/Ghana',time:'2026-07-07T20:00:00Z',group:'Round of 16',odds:{home:2.25,draw:3.15,away:3.00}}
  ];

  let matches=[];
  let existingById=new Map();
  let existingByKey=new Map();
  let fixtureById=new Map(fixtures.map(f=>[f.id,f]));
  let allowedIds=new Set();
  let unsub=null;
  let observer=null;

  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}}catch{}};
  const norm=s=>String(s||'').trim().toLowerCase();
  const key=m=>`${norm(m.home)}|${norm(m.away)}`;
  const hasResult=m=>!!(m&&String(m.result||'').trim());
  const msOf=v=>Date.parse(v||'');
  const started=v=>{const ms=msOf(v);return Number.isFinite(ms)&&Date.now()>=ms};

  async function isAdmin(){
    if(!ready())return false;
    const u=firebase.auth().currentUser;
    const s=await firebase.firestore().collection('users').doc(u.uid).get();
    return !!(s.exists&&s.data()?.isAdmin===true);
  }

  function rebuildMaps(docs){
    matches=docs||matches||[];
    existingById=new Map();
    existingByKey=new Map();
    matches.forEach(m=>{existingById.set(m.id,m);existingByKey.set(key(m),m)});
  }

  function existingForFixture(f){return existingById.get(f.id)||existingByKey.get(key(f));}

  function groupDone(group){
    const last=group[group.length-1];
    if(!last)return false;
    const lastDoc=existingForFixture(last);
    return hasResult(lastDoc);
  }

  function currentBatchIndex(){
    let batch=0;
    while(batch*BATCH_SIZE<fixtures.length){
      const group=fixtures.slice(batch*BATCH_SIZE,batch*BATCH_SIZE+BATCH_SIZE);
      if(groupDone(group))batch++; else break;
    }
    return Math.min(batch,Math.floor((fixtures.length-1)/BATCH_SIZE));
  }

  function currentGroup(){
    const batch=currentBatchIndex();
    return fixtures.slice(batch*BATCH_SIZE,batch*BATCH_SIZE+BATCH_SIZE);
  }

  function computeAllowedIds(){
    allowedIds=new Set();
    currentGroup().forEach(f=>{allowedIds.add(f.id);const doc=existingForFixture(f);if(doc?.id)allowedIds.add(doc.id)});
    return allowedIds;
  }

  function decorateBoard(){
    const list=document.getElementById('matchList');
    if(!list)return;
    computeAllowedIds();
    [...list.querySelectorAll('.match-card')].forEach(card=>{
      const btn=card.querySelector('.odd[data-m]');
      const id=btn?.dataset?.m||'';
      const doc=existingById.get(id);
      const f=fixtureById.get(id)||fixtures.find(x=>existingForFixture(x)?.id===id);
      const time=doc?.time||f?.time||'';
      const visible=allowedIds.has(id)&&!hasResult(doc)&&!started(time);
      card.style.display=visible?'':'none';
      card.querySelectorAll('.odd[data-m]').forEach(b=>{if(visible)b.removeAttribute('disabled');else b.disabled=true});
    });
  }

  function watchBoard(){
    const list=document.getElementById('matchList');
    if(!list||observer)return;
    observer=new MutationObserver(()=>setTimeout(decorateBoard,40));
    observer.observe(list,{childList:true,subtree:true});
  }

  function listenMatches(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(s=>{
      rebuildMaps(s.docs.map(d=>({id:d.id,...d.data()})));
      decorateBoard();
      setTimeout(()=>window.VM_RESULT_FIX?.refreshSelect?.(),180);
    },e=>console.warn('Upcoming match window listen failed',e));
  }

  async function seedCurrentBatch(){
    if(!(await isAdmin()))return;
    const db=firebase.firestore();
    const snap=await db.collection('matches').get();
    rebuildMaps(snap.docs.map(d=>({id:d.id,...d.data()})));
    const missing=currentGroup().filter(f=>!existingForFixture(f));
    if(!missing.length){decorateBoard();return}
    const batch=db.batch();
    const now=Date.now();
    missing.forEach(f=>batch.set(db.collection('matches').doc(f.id),{
      home:f.home,away:f.away,time:f.time,group:f.group,result:null,odds:f.odds,
      seeded:true,seedGroup:'four-match-window-2026',createdAtMs:now,
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true}));
    await batch.commit();
    toast(`${missing.length} kommende kamp(er) lagt ut for betting`);
    setTimeout(()=>window.VM_RESULT_FIX?.refreshSelect?.(),500);
  }

  function boot(){
    if(!ready())return;
    watchBoard();
    listenMatches();
    seedCurrentBatch().catch(e=>console.warn('Could not seed current match batch',e));
    setTimeout(decorateBoard,250);
    setTimeout(decorateBoard,900);
    setTimeout(decorateBoard,1800);
  }

  window.VM_UPCOMING_MATCH_SEED={boot,seedCurrentBatch,fixtures,currentGroup,computeAllowedIds};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,300);
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,700)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"]'))setTimeout(boot,160)});
  setInterval(decorateBoard,1200);
})();
