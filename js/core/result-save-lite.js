(()=>{
  if(window.VM_RESULT_SAVE_LITE)return;window.VM_RESULT_SAVE_LITE=true;
  let saving=false;
  const toast=m=>{try{const t=document.getElementById('toast');if(t){t.textContent=m;t.hidden=false;t.style.zIndex='999999';clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,6000)}else alert(m)}catch{alert(m)}};
  const ready=()=>{try{return firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  async function admin(){try{const u=firebase.auth().currentUser;if(!u)return false;const s=await firebase.firestore().collection('users').doc(u.uid).get();return !!(s.exists&&s.data()?.isAdmin===true)}catch{return false}}
  function css(){if(document.getElementById('resultSaveLiteCss'))return;const st=document.createElement('style');st.id='resultSaveLiteCss';st.textContent='#mobileResultBox{margin-bottom:96px!important;position:relative!important;z-index:50!important}#mobileSaveResult{position:relative!important;z-index:90!important;touch-action:manipulation!important}#mobileSaveResult:disabled{opacity:.6!important}';document.head.appendChild(st)}
  function active(sel){return document.querySelector(sel+'.active')||document.querySelector(sel+'[aria-pressed="true"]')}
  function textOf(el){return String(el?.textContent||'').trim()}
  function selectedMatchId(){return active('[data-result-match]')?.dataset?.resultMatch||''}
  function selectedPick(){return active('[data-result-pick]')?.dataset?.resultPick||''}
  async function save(){
    if(saving)return;if(!ready())return toast('Logg inn først');if(!(await admin()))return toast('Kun admin kan lagre resultat');
    const id=selectedMatchId(),result=selectedPick();
    if(!id)return toast('Velg kamp først');if(!result)return toast('Velg resultat først');
    saving=true;const btn=document.getElementById('mobileSaveResult');if(btn){btn.disabled=true;btn.textContent='Lagrer resultat...'}
    try{await firebase.firestore().collection('matches').doc(id).set({result,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAtMs:Date.now()},{merge:true});toast('Resultat lagret ✅');setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),600);setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),900)}
    catch(e){console.error('result save lite failed',e);toast((e?.code?e.code+': ':'')+(e?.message||'Kunne ikke lagre resultat'))}
    finally{saving=false;if(btn){btn.disabled=false;btn.textContent='Lagre resultat'}}
  }
  function bind(){css();document.addEventListener('click',e=>{if(e.target.closest?.('#mobileSaveResult')){e.preventDefault();e.stopImmediatePropagation();save()}},true);document.addEventListener('submit',e=>{if(e.target?.id==='resultForm'){e.preventDefault();e.stopImmediatePropagation()}},true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
