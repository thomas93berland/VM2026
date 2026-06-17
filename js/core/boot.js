(()=>{
  let busy=false;
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const money=n=>Number(n||0).toLocaleString('nb-NO');

  function ready(){
    try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}
    catch{return false}
  }

  async function isAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u)return false;
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      return s.exists&&s.data()?.isAdmin===true;
    }catch{return false}
  }

  async function getMatchResult(id,fallback){
    if(fallback&&id===fallback.id)return fallback.result;
    const s=await firebase.firestore().collection('matches').doc(id).get();
    return s.exists?s.data()?.result:null;
  }

  async function settleBet(betId,bet,forcedMatch){
    const db=firebase.firestore();
    const selections=Array.isArray(bet.selections)?bet.selections:[];
    if(!selections.length||bet.status!=='Aktiv')return {settled:false};

    let lost=false;
    let pending=false;

    for(const sel of selections){
      const res=await getMatchResult(sel.matchId,forcedMatch);
      if(!res){pending=true;continue}
      if(res!==sel.pick)lost=true;
    }

    if(pending&&!lost)return {settled:false};

    const stake=Number(bet.stake||0);
    const win=Number(bet.possibleWin||Math.floor(stake*Number(bet.totalOdds||1)));
    const userId=bet.userId;
    const batch=db.batch();
    const betRef=db.collection('bets').doc(betId);
    const userRef=db.collection('users').doc(userId);

    if(lost){
      batch.update(betRef,{status:'Tapt',settledAtMs:Date.now(),settledAt:firebase.firestore.FieldValue.serverTimestamp()});
      batch.update(userRef,{completedBets:firebase.firestore.FieldValue.increment(1),netProfit:firebase.firestore.FieldValue.increment(-stake),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
      await batch.commit();
      return {settled:true,won:false,amount:0};
    }

    batch.update(betRef,{status:'Vunnet',payout:win,settledAtMs:Date.now(),settledAt:firebase.firestore.FieldValue.serverTimestamp()});
    batch.update(userRef,{coins:firebase.firestore.FieldValue.increment(win),wonBets:firebase.firestore.FieldValue.increment(1),completedBets:firebase.firestore.FieldValue.increment(1),netProfit:firebase.firestore.FieldValue.increment(win-stake),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    await batch.commit();
    return {settled:true,won:true,amount:win};
  }

  async function settleAll(forcedMatch=null){
    if(busy)return;
    if(!ready())return;
    busy=true;
    try{
      if(!(await isAdmin())){toast('Kun admin kan utbetale gevinster');return}
      const db=firebase.firestore();
      const snap=await db.collection('bets').where('status','==','Aktiv').get();
      let settled=0,won=0,paid=0;
      for(const doc of snap.docs){
        const res=await settleBet(doc.id,doc.data(),forcedMatch);
        if(res.settled){settled++;if(res.won){won++;paid+=res.amount}}
      }
      toast(settled?`Utbetaling ferdig: ${won} vunnet, ${money(paid)} VM Coins betalt`:'Ingen ferdige bets å utbetale ennå');
    }catch(e){
      console.error('Payout error',e);
      toast('Kunne ikke utbetale gevinster. Sjekk admin/rettigheter.');
    }finally{busy=false}
  }

  function addPayoutButton(){
    const panel=document.getElementById('adminPanel');
    if(!panel||document.getElementById('safePayoutBtn'))return;
    const btn=document.createElement('button');
    btn.id='safePayoutBtn';
    btn.type='button';
    btn.className='btn secondary compact';
    btn.textContent='Utbetal gevinster';
    btn.style.marginTop='10px';
    btn.onclick=()=>settleAll();
    panel.appendChild(btn);
  }

  function hookResultForm(){
    const form=document.getElementById('resultForm');
    if(!form||form.dataset.payoutHooked==='1')return;
    form.dataset.payoutHooked='1';
    form.addEventListener('submit',async()=>{
      try{
        const data=new FormData(form);
        const id=data.get('matchId');
        const result=data.get('result');
        if(!id||!result)return;
        await wait(1200);
        await settleAll({id,result});
      }catch(e){console.warn('Auto payout skipped',e)}
    });
  }

  function boot(){
    addPayoutButton();
    hookResultForm();
    setTimeout(addPayoutButton,700);
    setTimeout(hookResultForm,700);
    setTimeout(addPayoutButton,1600);
    setTimeout(hookResultForm,1600);
  }

  window.VM_SAFE_BOOT={startAll:boot,settleBets:settleAll};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)boot()})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page]'))setTimeout(boot,300)});
})();
