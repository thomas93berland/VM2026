(()=>{
  const ADMIN_EMAIL='thomas93berland@gmail.com';
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4500)}else alert(msg)}catch{alert(msg)}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const N=n=>Number(n||0).toLocaleString('nb-NO');
  const hasResult=m=>!!String(m?.result||'').trim();
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const label=(m,p)=>p==='home'?(m.home||'Hjemme'):p==='away'?(m.away||'Borte'):'Uavgjort';
  const odds=(m,p)=>Number(m?.odds?.[p]||1);

  let admin=false;
  let lastSelectHtml='';
  let lock=false;
  let matchMap=new Map();

  async function adminCheck(){
    if(!ready())return false;
    const u=firebase.auth().currentUser;
    const email=String(u.email||'').toLowerCase();
    try{
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=email===ADMIN_EMAIL||!!(s.exists&&s.data()?.isAdmin===true);
    }catch(e){
      console.warn('Rescue admin check failed',e);
      admin=email===ADMIN_EMAIL;
    }
    const panel=document.getElementById('adminPanel');
    const locked=document.getElementById('adminLocked');
    if(panel){panel.hidden=!admin;if(admin)panel.style.display='block';}
    if(locked)locked.hidden=admin;
    document.querySelectorAll('.admin-only').forEach(el=>{if(admin){el.hidden=false;el.style.display='block';}});
    return admin;
  }

  async function loadMatches(){
    const s=await firebase.firestore().collection('matches').get();
    const arr=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
    matchMap=new Map(arr.map(m=>[m.id,m]));
    return arr;
  }

  function unlockSelect(select){
    if(!select)return;
    select.dataset.resultSelectorLocked='no';
    select.dataset.quickResultLocked='no';
    select.disabled=false;
    select.style.pointerEvents='auto';
    select.style.position='relative';
    select.style.zIndex='999';
  }

  async function fillResultSelector(){
    if(!ready())return;
    const select=document.getElementById('resultMatchSelect');
    if(!select)return;
    if(!admin)await adminCheck();
    if(!admin)return;
    unlockSelect(select);
    const current=select.value;
    const missing=(await loadMatches()).filter(m=>!hasResult(m));
    const body=missing.length
      ? missing.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))}</option>`).join('')
      : '<option value="" disabled>Ingen kamper uten resultat</option>';
    const html='<option value="">Velg kamp uten resultat</option>'+body;
    if(html!==lastSelectHtml||select.innerHTML!==html||select.options.length<2){
      lastSelectHtml=html;
      select.innerHTML=html;
      if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    }
  }

  async function submitResult(e){
    const form=e.target?.closest?.('#resultForm');
    if(!form)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(lock)return;
    lock=true;
    try{
      if(!(await adminCheck()))return toast('Du mangler admin-rettighet i Firestore');
      const fd=new FormData(form);
      const id=String(fd.get('matchId')||'').trim();
      const result=String(fd.get('result')||'').trim();
      if(!id||!result)return toast('Velg kamp og resultat');
      await firebase.firestore().collection('matches').doc(id).set({
        result,
        updatedAtMs:Date.now(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      form.reset();
      lastSelectHtml='';
      toast('Resultat lagt inn');
      setTimeout(fillResultSelector,250);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),850);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1200);
      setTimeout(()=>window.VM_QUICK_RESULT?.render?.(),1300);
    }catch(err){
      console.error('Result rescue failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
    }finally{lock=false;}
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
      buttons.forEach(b=>{
        b.disabled=false;
        b.style.pointerEvents='auto';
        b.style.cursor='pointer';
        b.removeAttribute('aria-disabled');
      });
    });
  }

  function selectedButtons(){
    return [...document.querySelectorAll('#matchList .odd.selected[data-m][data-p]')].filter(b=>!b.disabled&&b.offsetParent!==null);
  }

  function updateSlipDom(){
    const buttons=selectedButtons();
    const count=document.getElementById('slipCount');
    const empty=document.getElementById('slipEmpty');
    const content=document.getElementById('slipContent');
    const items=document.getElementById('slipItems');
    const stakeInput=document.getElementById('stakeInput');
    const totalOddsEl=document.getElementById('totalOdds');
    const winEl=document.getElementById('possibleWin');
    if(count)count.textContent=String(buttons.length);
    if(empty)empty.hidden=buttons.length>0;
    if(content)content.hidden=buttons.length===0;
    const rows=buttons.map(b=>{
      const card=b.closest('.match-card');
      const teams=[...card?.querySelectorAll('.teams strong')||[]].map(x=>x.textContent.trim());
      const titleText=teams.length>=2?`${teams[0]} – ${teams[1]}`:'Valgt kamp';
      const labelText=b.querySelector('small')?.textContent?.trim()||'Valg';
      const oddText=b.querySelector('strong')?.textContent?.trim()||'1.00';
      return {titleText,labelText,odd:Number(oddText)||1};
    });
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
        const id=b.dataset.m;
        const pick=b.dataset.p;
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
      document.querySelectorAll('#matchList .odd.selected').forEach(x=>x.classList.remove('selected'));
      updateSlipDom();
      toast(`Spill plassert · mulig gevinst ${N(possibleWin)} VM Coins`);
    }catch(err){
      console.error('Bet rescue failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke plassere bet'));
    }finally{lock=false;}
  }

  function boot(){
    if(!ready())return;
    adminCheck().then(fillResultSelector).catch(console.warn);
    loadMatches().then(()=>{enableOpenOdds();updateSlipDom();}).catch(console.warn);
  }

  document.addEventListener('submit',submitResult,true);
  document.addEventListener('click',selectOdd,true);
  document.addEventListener('click',placeBet,true);
  document.addEventListener('input',e=>{if(e.target?.id==='stakeInput')updateSlipDom();},true);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#matchList,#adminPanel,#resultForm,#resultMatchSelect,#placeBetBtn'))setTimeout(boot,220)},true);
  window.VM_BETTING_ACTION_RESCUE={boot,fillResultSelector,placeBet,adminCheck,enableOpenOdds,updateSlipDom};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,600);
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,800)})}catch{}
  setInterval(boot,1600);
})();
