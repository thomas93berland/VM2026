(()=>{
  const BATCH_SIZE=4;
  const fixtures=[
    {id:'wc2026-esp-ksa-2026-06-21',home:'Spania',away:'Saudi-Arabia',time:'2026-06-21T16:00:00Z',group:'Group H',odds:{home:1.32,draw:5.10,away:8.00}},
    {id:'wc2026-bel-iri-2026-06-21',home:'Belgia',away:'Iran',time:'2026-06-21T19:00:00Z',group:'Group G',odds:{home:1.70,draw:3.65,away:4.55}},
    {id:'wc2026-uru-cpv-2026-06-21',home:'Uruguay',away:'Kapp Verde',time:'2026-06-21T22:00:00Z',group:'Group H',odds:{home:1.44,draw:4.25,away:6.40}},
    {id:'wc2026-nzl-egy-2026-06-22',home:'New Zealand',away:'Egypt',time:'2026-06-22T01:00:00Z',group:'Group G',odds:{home:4.90,draw:3.55,away:1.68}},
    {id:'wc2026-arg-aut-2026-06-22',home:'Argentina',away:'Østerrike',time:'2026-06-22T17:00:00Z',group:'Group J',odds:{home:1.62,draw:3.80,away:4.95}},
    {id:'wc2026-fra-irq-2026-06-22',home:'Frankrike',away:'Irak',time:'2026-06-22T21:00:00Z',group:'Group I',odds:{home:1.25,draw:5.60,away:10.00}},
    {id:'wc2026-nor-sen-2026-06-23',home:'Norge',away:'Senegal',time:'2026-06-23T00:00:00Z',group:'Group I',odds:{home:2.18,draw:3.25,away:3.05}},
    {id:'wc2026-jor-dza-2026-06-23',home:'Jordan',away:'Algerie',time:'2026-06-23T03:00:00Z',group:'Group J',odds:{home:4.70,draw:3.45,away:1.72}},
    {id:'wc2026-por-uzb-2026-06-23',home:'Portugal',away:'Usbekistan',time:'2026-06-23T17:00:00Z',group:'Group K',odds:{home:1.35,draw:4.90,away:7.50}},
    {id:'wc2026-eng-gha-2026-06-23',home:'England',away:'Ghana',time:'2026-06-23T20:00:00Z',group:'Group L',odds:{home:1.48,draw:4.15,away:6.10}},
    {id:'wc2026-pan-cro-2026-06-23',home:'Panama',away:'Kroatia',time:'2026-06-23T23:00:00Z',group:'Group L',odds:{home:5.80,draw:3.85,away:1.55}},
    {id:'wc2026-col-cod-2026-06-24',home:'Colombia',away:'DR Kongo',time:'2026-06-24T02:00:00Z',group:'Group K',odds:{home:1.82,draw:3.45,away:4.05}},
    {id:'wc2026-sui-can-2026-06-24',home:'Sveits',away:'Canada',time:'2026-06-24T19:00:00Z',group:'Group B',odds:{home:2.40,draw:3.25,away:2.72}},
    {id:'wc2026-bih-qat-2026-06-24',home:'Bosnia-Hercegovina',away:'Qatar',time:'2026-06-24T19:00:00Z',group:'Group B',odds:{home:1.78,draw:3.55,away:4.25}},
    {id:'wc2026-sco-bra-2026-06-24',home:'Skottland',away:'Brasil',time:'2026-06-24T22:00:00Z',group:'Group C',odds:{home:6.20,draw:4.10,away:1.45}},
    {id:'wc2026-mar-hti-2026-06-24',home:'Marokko',away:'Haiti',time:'2026-06-24T22:00:00Z',group:'Group C',odds:{home:1.42,draw:4.30,away:6.70}},
    {id:'wc2026-cze-mex-2026-06-25',home:'Tsjekkia',away:'Mexico',time:'2026-06-25T01:00:00Z',group:'Group A',odds:{home:3.10,draw:3.20,away:2.20}},
    {id:'wc2026-rsa-kor-2026-06-25',home:'Sør-Afrika',away:'Sør-Korea',time:'2026-06-25T01:00:00Z',group:'Group A',odds:{home:3.55,draw:3.25,away:1.98}},
    {id:'wc2026-ecu-ger-2026-06-25',home:'Ecuador',away:'Tyskland',time:'2026-06-25T20:00:00Z',group:'Group E',odds:{home:4.20,draw:3.60,away:1.72}},
    {id:'wc2026-cuw-civ-2026-06-25',home:'Curaçao',away:'Elfenbenskysten',time:'2026-06-25T20:00:00Z',group:'Group E',odds:{home:5.70,draw:3.85,away:1.55}},
    {id:'wc2026-tun-ned-2026-06-25',home:'Tunisia',away:'Nederland',time:'2026-06-25T23:00:00Z',group:'Group F',odds:{home:5.10,draw:3.75,away:1.60}},
    {id:'wc2026-jpn-swe-2026-06-25',home:'Japan',away:'Sverige',time:'2026-06-25T23:00:00Z',group:'Group F',odds:{home:2.75,draw:3.20,away:2.40}},
    {id:'wc2026-tur-usa-2026-06-26',home:'Tyrkia',away:'USA',time:'2026-06-26T02:00:00Z',group:'Group D',odds:{home:3.25,draw:3.35,away:2.05}},
    {id:'wc2026-par-aus-2026-06-26',home:'Paraguay',away:'Australia',time:'2026-06-26T02:00:00Z',group:'Group D',odds:{home:2.35,draw:3.20,away:2.85}}
  ];

  let matches=[];
  let existingById=new Map();
  let existingByKey=new Map();
  let allowedIds=new Set();
  let unsub=null;
  let observer=null;

  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}}catch{}};
  const norm=s=>String(s||'').trim().toLowerCase();
  const key=m=>`${norm(m.home)}|${norm(m.away)}`;
  const hasResult=m=>!!(m&&String(m.result||'').trim());

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
    matches.forEach(m=>{
      existingById.set(m.id,m);
      existingByKey.set(key(m),m);
    });
  }

  function existingForFixture(f){return existingById.get(f.id)||existingByKey.get(key(f));}

  function currentBatchIndex(){
    let batch=0;
    while(batch*BATCH_SIZE<fixtures.length){
      const group=fixtures.slice(batch*BATCH_SIZE,batch*BATCH_SIZE+BATCH_SIZE);
      const last=group[group.length-1];
      if(!last)break;
      const lastDoc=existingForFixture(last);
      if(hasResult(lastDoc))batch++;
      else break;
    }
    return Math.min(batch,Math.floor((fixtures.length-1)/BATCH_SIZE));
  }

  function currentGroup(){
    const batch=currentBatchIndex();
    return fixtures.slice(batch*BATCH_SIZE,batch*BATCH_SIZE+BATCH_SIZE);
  }

  function computeAllowedIds(){
    allowedIds=new Set();
    currentGroup().forEach(f=>{
      allowedIds.add(f.id);
      const doc=existingForFixture(f);
      if(doc?.id)allowedIds.add(doc.id);
    });
    return allowedIds;
  }

  function decorateBoard(){
    const list=document.getElementById('matchList');
    if(!list)return;
    computeAllowedIds();
    [...list.querySelectorAll('.match-card')].forEach(card=>{
      const id=card.querySelector('.odd[data-m]')?.dataset?.m||'';
      card.style.display=allowedIds.has(id)?'':'none';
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
    },e=>console.warn('Upcoming match window listen failed',e));
  }

  async function seedCurrentBatch(){
    if(!(await isAdmin()))return;
    const db=firebase.firestore();
    const snap=await db.collection('matches').get();
    rebuildMaps(snap.docs.map(d=>({id:d.id,...d.data()})));
    const group=currentGroup();
    const missing=group.filter(f=>!existingForFixture(f));
    if(!missing.length){decorateBoard();return;}
    const batch=db.batch();
    const now=Date.now();
    missing.forEach(f=>{
      batch.set(db.collection('matches').doc(f.id),{
        home:f.home,away:f.away,time:f.time,group:f.group,result:null,odds:f.odds,
        seeded:true,seedGroup:'upcoming-vm-2026',createdAtMs:now,
        createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
    });
    await batch.commit();
    toast(`${missing.length} kommende kamp(er) lagt ut for betting`);
    setTimeout(()=>window.VM_RESULT_FIX?.refreshSelect?.(),800);
  }

  function boot(){
    if(!ready())return;
    watchBoard();
    listenMatches();
    seedCurrentBatch().catch(e=>console.warn('Could not seed current match batch',e));
    setTimeout(decorateBoard,500);
    setTimeout(decorateBoard,1500);
  }

  window.VM_UPCOMING_MATCH_SEED={boot,seedCurrentBatch,fixtures,currentGroup,computeAllowedIds};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,600);
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,1200)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"]'))setTimeout(boot,250)});
  setInterval(decorateBoard,2500);
})();
