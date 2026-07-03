(()=>{
  const ADMIN_EMAIL='thomas93berland@gmail.com';
  const ADMIN_UID='XJmquxcEDCYOROxHOSzRiiEpvWv1';
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,5200)}else alert(msg)}catch{alert(msg)}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const N=n=>Number(n||0).toLocaleString('nb-NO');
  const num=v=>Number(String(v??'').replace(',','.'))||0;
  const hasResult=m=>!!String(m?.result||'').trim();
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const label=(m,p)=>p==='home'?(m.home||'Hjemme'):p==='away'?(m.away||'Borte'):'Uavgjort';
  const odds=(m,p)=>Number(m?.odds?.[p]||1);
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const started=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)&&ms<Date.now()};

  let admin=false;
  let identityThomas=false;
  let lock=false;
  let matchMap=new Map();

  function isThomasUser(u){
    const email=String(u?.email||'').toLowerCase();
    return !!u && (u.uid===ADMIN_UID || email===ADMIN_EMAIL);
  }

  async function adminCheck(){
    if(!ready())return false;
    const u=firebase.auth().currentUser;
    identityThomas=isThomasUser(u);
    let firestoreAdmin=false;
    try{
      const ref=firebase.firestore().collection('users').doc(u.uid);
      const s=await ref.get();
      firestoreAdmin=!!(s.exists&&s.data()?.isAdmin===true);
      if(identityThomas && !firestoreAdmin){
        ref.set({uid:u.uid,email:u.email||'',name:s.exists?(s.data().name||u.displayName||'Thomas'):(u.displayName||'Thomas'),isAdmin:true,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}, {merge:true}).catch(()=>{});
      }
    }catch(e){console.warn('Admin check failed',e)}
    admin=identityThomas||firestoreAdmin;
    openAdminUi();
    return admin;
  }

  function openAdminUi(){
    const panel=document.getElementById('adminPanel');
    const locked=document.getElementById('adminLocked');
    if(panel){panel.hidden=false;panel.style.display='block';panel.classList.remove('admin-locked')}
    if(locked)locked.hidden=true;
    document.querySelectorAll('.admin-only').forEach(el=>{el.hidden=false;el.style.display='block'});
  }

  async function loadMatches(){
    if(!ready())return [];
    const s=await firebase.firestore().collection('matches').get();
    const arr=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
    matchMap=new Map(arr.map(m=>[m.id,m]));
    return arr;
  }

  async function fillResultSelector(){
    const select=document.getElementById('resultMatchSelect');
    if(!select||!ready())return;
    await adminCheck();
    if(!admin)return;
    const current=select.value;
    const unresolved=(await loadMatches()).filter(m=>!hasResult(m)).sort((a,b)=>{
      const sa=started(a)?0:1,sb=started(b)?0:1;
      return sa-sb||String(a.time||'').localeCompare(String(b.time||''));
    });
    select.style.display='block';
    select.style.pointerEvents='auto';
    select.disabled=false;
    const options=unresolved.length
      ? unresolved.map(m=>`<option value="${esc(m.id)}">${started(m)?'⏰ Slutt/startet':'🟢 Ikke spilt'} · ${esc(when(m.time))} · ${esc(title(m))}</option>`).join('')
      : '<option value="" disabled>Ingen kamper uten resultat</option>';
    select.innerHTML='<option value="">Velg kamp uten resultat</option>'+options;
    if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    const form=document.getElementById('resultForm');
    if(form){form.style.display='grid';form.hidden=false;form.style.pointerEvents='auto'}
  }

  async function submitMatch(e){
    const form=e.target?.closest?.('#matchForm');
    if(!form)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(lock)return;
    lock=true;
    try{
      if(!(await adminCheck()))return toast('Kun Thomas/admin kan legge inn kamper');
      const f=new FormData(form);
      const home=String(f.get('home')||'').trim();
      const away=String(f.get('away')||'').trim();
      const time=String(f.get('time')||'').trim();
      const homeOdds=num(f.get('homeOdds'));
      const drawOdds=num(f.get('drawOdds'));
      const awayOdds=num(f.get('awayOdds'));
      if(!home||!away||!time)return toast('Fyll inn hjemmelag, bortelag og tid');
      if(homeOdds<=1||drawOdds<=1||awayOdds<=1)return toast('Odds må være høyere enn 1.00');
      await firebase.firestore().collection('matches').add({
        home,away,time,group:'VM 2026',result:null,
        odds:{home:homeOdds,draw:drawOdds,away:awayOdds},
        createdBy:firebase.auth().currentUser.uid,
        createdAtMs:Date.now(),
        createdAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      });
      form.reset();
      toast('Kamp lagt til ✅');
      setTimeout(boot,500);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1000);
    }catch(err){
      console.error('Add match failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge til kamp'));
    }finally{lock=false}
  }

  async function submitResult(e){
    const form=e.target?.closest?.('#resultForm');
    if(!form)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(lock)return;
    lock=true;
    try{
      if(!(await adminCheck()))return toast('Kun Thomas/admin kan legge inn resultat');
      const f=new FormData(form);
      const id=String(f.get('matchId')||'').trim();
      const result=String(f.get('result')||'').trim();
      if(!id||!result)return toast('Velg kamp og resultat');
      const m=matchMap.get(id)||(await firebase.firestore().collection('matches').doc(id).get()).data()||{};
      await firebase.firestore().collection('matches').doc(id).set({
        result,
        resultLabel:label(m,result),
        status:'Ferdig',
        updatedBy:firebase.auth().currentUser.uid,
        updatedAtMs:Date.now(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      form.reset();
      toast('Resultat lagt inn ✅');
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),850);
      setTimeout(boot,900);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1200);
    }catch(err){
      console.error('Result save failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
    }finally{lock=false}
  }

  async function enableOpenOdds(){
    if(!ready())return;
    if(!matchMap.size)await loadMatches();
    document.querySelectorAll('#matchList .match-card').forEach(card=>{
      const first=card.querySelector('.odd[data-m]');
      if(!first)return;
      const id=first.dataset.m;
      const m=matchMap.get(id);
      const buttons=[...card.querySelectorAll('.odd[data-m][data-p]')];
      if(m&&hasResult(m)){
        card.classList.add('safe-finished');
        card.classList.remove('safe-open','safe-waiting-result');
        buttons.forEach(b=>b.disabled=true);
        return;
      }
      card.classList.add('safe-open');
      card.classList.remove('safe-finished','safe-waiting-result');
      card.querySelector('.safe-match-status')?.remove();
      buttons.forEach(b=>{b.disabled=false;b.style.pointerEvents='auto';b.style.cursor='pointer';b.removeAttribute('aria-disabled')});
    });
  }

  function selectedButtons(){return[...document.querySelectorAll('#matchList .odd.selected[data-m][data-p]')].filter(b=>!b.disabled&&b.offsetParent!==null)}

  function updateSlipDom(){
    const buttons=selectedButtons();
    const count=document.getElementById('slipCount'),empty=document.getElementById('slipEmpty'),content=document.getElementById('slipContent'),items=document.getElementById('slipItems'),stakeInput=document.getElementById('stakeInput'),totalOddsEl=document.getElementById('totalOdds'),winEl=document.getElementById('possibleWin');
    if(count)count.textContent=String(buttons.length);
    if(empty)empty.hidden=buttons.length>0;
    if(content)content.hidden=buttons.length===0;
    const rows=buttons.map(b=>{const card=b.closest('.match-card');const teams=[...card?.querySelectorAll('.teams strong')||[]].map(x=>x.textContent.trim());const titleText=teams.length>=2?`${teams[0]} – ${teams[1]}`:'Valgt kamp';const labelText=b.querySelector('small')?.textContent?.trim()||'Valg';const oddText=b.querySelector('strong')?.textContent?.trim()||'1.00';return{titleText,labelText,odd:Number(oddText)||1}});
    if(items)items.innerHTML=rows.map(s=>`<div class="slip-item"><div><b>${esc(s.labelText)}</b><small>${esc(s.titleText)}</small></div><b>${s.odd.toFixed(2)}</b></div>`).join('');
    const stake=Math.min(Number(stakeInput?.value||0)||0,Number(window.VM_RULES?.MAX_STAKE||500));
    const total=rows.reduce((a,s)=>a*Number(s.odd||1),1);
    if(totalOddsEl)totalOddsEl.textContent=total.toFixed(2);
    if(winEl)winEl.textContent=N(Math.floor(stake*total));
  }

  async function selectOdd(e){
    const btn=e.target?.closest?.('#matchList .odd[data-m][data-p]');
    if(!btn)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    await enableOpenOdds();
    if(btn.disabled)return toast('Denne kampen er låst');
    const card=btn.closest('.match-card');
    const id=btn.dataset.m;
    const m=matchMap.get(id);
    if(m&&hasResult(m))return toast(`${title(m)} har allerede resultat`);
    const wasSelected=btn.classList.contains('selected');
    card?.querySelectorAll('.odd[data-m][data-p]').forEach(x=>x.classList.remove('selected'));
    if(!wasSelected)btn.classList.add('selected');
    updateSlipDom();
  }

  async function placeBet(e){
    const btn=e.target?.closest?.('#placeBetBtn');
    if(!btn)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(lock)return;
    lock=true;
    try{
      if(!ready())return toast('Logg inn først');
      await enableOpenOdds();
      const u=firebase.auth().currentUser;
      const userRef=firebase.firestore().collection('users').doc(u.uid);
      const userSnap=await userRef.get();
      const profile=userSnap.exists?userSnap.data():{};
      const coins=Number(profile.coins||0);
      const max=Number(window.VM_RULES?.MAX_STAKE||500);
      const stake=Number(document.getElementById('stakeInput')?.value||0);
      if(stake<10)return toast('Innsats må være minst 10');
      if(stake>max)return toast('Maks innsats er '+max);
      if(stake>coins)return toast('Ikke nok VM Coins');
      const buttons=selectedButtons();
      if(!buttons.length)return toast('Velg odds først');
      const selections=[];
      for(const b of buttons){
        const id=b.dataset.m,pick=b.dataset.p;
        const mSnap=await firebase.firestore().collection('matches').doc(id).get();
        if(!mSnap.exists)return toast('Kampen finnes ikke lenger');
        const m={id:mSnap.id,...mSnap.data()};
        if(hasResult(m))return toast(`${title(m)} har allerede resultat`);
        selections.push({matchId:id,pick,odds:odds(m,pick),title:title(m),label:label(m,pick)});
      }
      const total=selections.reduce((a,s)=>a*Number(s.odds||1),1);
      const possibleWin=Math.floor(stake*total);
      const batch=firebase.firestore().batch();
      const betRef=firebase.firestore().collection('bets').doc();
      batch.set(betRef,{userId:u.uid,userName:profile.name||u.displayName||u.email?.split('@')[0]||'Spiller',selections,stake,totalOdds:Number(total.toFixed(2)),possibleWin,status:'Aktiv',createdAtMs:Date.now(),createdAt:firebase.firestore.FieldValue.serverTimestamp()});
      batch.update(userRef,{coins:firebase.firestore.FieldValue.increment(-stake),placedBets:firebase.firestore.FieldValue.increment(1),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
      await batch.commit();
      document.querySelectorAll('#matchList .odd.selected').forEach(b=>b.classList.remove('selected'));
      updateSlipDom();
      toast(`Spill plassert · mulig gevinst ${N(possibleWin)} VM Coins`);
    }catch(err){
      console.error('Bet rescue failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke plassere bet'));
    }finally{lock=false}
  }

  async function boot(){
    if(!ready())return;
    await adminCheck();
    await loadMatches().catch(console.warn);
    await fillResultSelector().catch(console.warn);
    enableOpenOdds().catch(console.warn);
    updateSlipDom();
  }

  document.addEventListener('submit',submitMatch,true);
  document.addEventListener('submit',submitResult,true);
  document.addEventListener('click',selectOdd,true);
  document.addEventListener('click',placeBet,true);
  document.addEventListener('input',e=>{if(e.target?.id==='stakeInput')updateSlipDom()},true);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#matchList,#adminPanel,#placeBetBtn,#resultForm,#matchForm'))setTimeout(boot,220)},true);
  window.VM_BETTING_ACTION_RESCUE={boot,fillResultSelector,placeBet,adminCheck,enableOpenOdds,updateSlipDom};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,500);
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,700)})}catch{}
  setInterval(boot,2500);
})();
