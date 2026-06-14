(()=>{
  let db=null,auth=null,me=null,busy=false;
  const WIN_ELO=25;
  const LOSS_ELO=-15;
  function init(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return false;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();
    db=firebase.firestore();
    return true;
  }
  async function getMe(uid){
    const doc=await db.collection('users').doc(uid).get();
    return doc.exists?doc.data():null;
  }
  function matchResult(match){
    const r=match&&match.result;
    if(!r)return '';
    const raw=String(r).trim().toLowerCase();
    if(raw==='home'||raw==='draw'||raw==='away')return raw;
    const nums=raw.match(/\d+/g);
    if(nums&&nums.length>=2){
      const h=Number(nums[0]);
      const a=Number(nums[1]);
      if(h>a)return 'home';
      if(a>h)return 'away';
      return 'draw';
    }
    return raw;
  }
  function isBetReady(bet,matchMap){
    const selections=bet.selections||[];
    if(!selections.length)return false;
    return selections.every(s=>matchResult(matchMap[s.matchId]));
  }
  function isBetWon(bet,matchMap){
    return (bet.selections||[]).every(s=>matchResult(matchMap[s.matchId])===String(s.pick));
  }
  async function settle(){
    if(busy||!me||!me.isAdmin)return;
    busy=true;
    try{
      const ms=await db.collection('matches').get();
      const matchMap={};
      ms.docs.forEach(d=>matchMap[d.id]={id:d.id,...d.data()});
      const active=await db.collection('bets').where('status','==','Aktiv').get();
      const unpaidWon=await db.collection('bets').where('status','==','Vunnet').get();
      const docs=[...active.docs,...unpaidWon.docs];
      for(const d of docs){
        const bet={id:d.id,...d.data()};
        if(bet.payoutPaid===true)continue;
        if(!isBetReady(bet,matchMap)&&bet.status==='Aktiv')continue;
        const won=bet.status==='Vunnet'?true:isBetWon(bet,matchMap);
        const userRef=db.collection('users').doc(bet.userId);
        const betRef=db.collection('bets').doc(bet.id);
        const stake=Number(bet.stake||0);
        const payout=Number(bet.possibleWin||0);
        const net=won?payout-stake:-stake;
        const batch=db.batch();
        const betUpdate={
          status:won?'Vunnet':'Tapt',
          settledAtMs:bet.settledAtMs||Date.now(),
          settledAt:firebase.firestore.FieldValue.serverTimestamp(),
          gamblingEloDelta:won?WIN_ELO:LOSS_ELO,
          netResult:net
        };
        if(won)betUpdate.payoutPaid=true;
        batch.update(betRef,betUpdate);
        const userUpdate={updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
        if(bet.status==='Aktiv'){
          userUpdate.completedBets=firebase.firestore.FieldValue.increment(1);
          userUpdate.netProfit=firebase.firestore.FieldValue.increment(net);
          userUpdate.elo=firebase.firestore.FieldValue.increment(won?WIN_ELO:LOSS_ELO);
          userUpdate.gamblingElo=firebase.firestore.FieldValue.increment(won?WIN_ELO:LOSS_ELO);
          if(won)userUpdate.wonBets=firebase.firestore.FieldValue.increment(1);
        }
        if(won)userUpdate.coins=firebase.firestore.FieldValue.increment(payout);
        batch.update(userRef,userUpdate);
        await batch.commit();
      }
    }catch(e){console.warn('gambling elo settlement',e)}
    busy=false;
  }
  function boot(){
    if(!init())return;
    auth.onAuthStateChanged(async u=>{
      if(!u){me=null;return}
      me=await getMe(u.uid);
      if(me&&me.isAdmin){
        settle();
        db.collection('matches').onSnapshot(()=>settle());
        db.collection('bets').where('status','==','Aktiv').onSnapshot(()=>settle());
        db.collection('bets').where('status','==','Vunnet').onSnapshot(()=>settle());
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
