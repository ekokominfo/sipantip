'use strict';
function countLabel(n){return !state.loaded?'Data belum tersedia':fmt(n)+' titik panas';}
function airCategory(a){if(!Number.isFinite(a))return null;const band=a<=50?0:a<=100?1:a<=150?2:a<=200?3:a<=300?4:5;return {band,label:['Baik','Sedang','Tidak sehat bagi kelompok sensitif','Tidak sehat','Sangat tidak sehat','Berbahaya'][band]};}
function setLoad(key,phase,message=''){
 const el=document.getElementById('status-'+key);if(!el)return;
 el.hidden=phase==='ready'||phase==='updated';el.dataset.phase=phase;el.replaceChildren();
 if(phase==='ready')return;
 const text=document.createElement('span');text.textContent=message;el.append(text);
}
function sourceAge(t){const n=Date.parse(t);return Number.isFinite(n)?Date.now()-n:null;}
function modelStamp(t){return t?t+':00+07:00':'';}
function updateHotspotCard(now=Date.now()){
 const time=$('hotspotDataTime'),warning=$('hotspotDataWarning');if(!time||!warning)return;
 const times=(state.raw||[]).map(r=>detectionTime(r.when)).filter(t=>Number.isFinite(t)&&t<=now),latest=times.length?Math.max(...times):null;
 time.textContent=latest===null?'Waktu deteksi terbaru belum tersedia':'Deteksi terbaru: '+new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(latest))+' WIB ('+(now-latest<3600000?'kurang dari 1 jam lalu':'sekitar '+Math.floor((now-latest)/3600000)+' jam lalu')+')';
 const compact=$('hotspotDataTimeCompact');if(compact){compact.textContent=latest===null?'Waktu belum tersedia':new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(latest))+' WIB · '+(now-latest<3600000?'baru saja':Math.floor((now-latest)/3600000)+' jam lalu');compact.setAttribute('aria-label',time.textContent);}
 const status=typeof CachedData!=='undefined'?CachedData.status(['hotspot-High','hotspot-Medium','hotspot-Low']):null;
 const failed=!!status?.items?.some(item=>item.error),connection=!!status?.transportError,oldDetection=latest!==null&&now-latest>6*3600000;
 warning.hidden=!failed&&!connection&&!oldDetection;
 warning.textContent=failed?'Penarikan data dari sumber sedang mengalami masalah.':connection?'Koneksi ke data titik panas terganggu; menampilkan data terakhir.':'Belum ada deteksi titik panas terbaru dari satelit.';
}
function updateFreshness(){
 updateHotspotCard();
 const el=$('freshness');if(!el)return;const ts=(state.sourceDates||[]).map(t=>Date.parse(t)).filter(Number.isFinite),oldest=ts.length?Math.min(...ts):null;
 const parts=[oldest===null?'Waktu sumber titik panas belum tersedia':(state.hotspotTimestampKind==='retrieved'?'Diambil dari '+(state.hotspotSource||'sumber')+': ':'Sumber titik panas: ')+wib(new Date(oldest))+(Date.now()-oldest>24*3600000?' · data lebih dari 24 jam':'' )];
 if(state.airSource){const age=sourceAge(modelStamp(state.airSource));parts.push('Sumber PM 2.5: '+state.airSource.replace('T',' ')+' WIB'+(age>3*3600000?' · data lebih dari 3 jam':''));}
 el.textContent=parts.join(' | ');el.classList.toggle('stale',Boolean(oldest&&Date.now()-oldest>24*3600000)||sourceAge(modelStamp(state.airSource))>3*3600000);
}
function updateActiveFilters(){
 const el=$('activeFilters');if(!el)return;const village=typeof extras!=='undefined'?extras.villages.find(v=>v.key===state.selectedVillage):null;
 const period=$('date').selectedOptions[0]?.textContent||'24 jam terakhir';
 el.textContent=[village?village.name:($('district').value||'Semua kecamatan'),period,$('confidence').value?NAMES[$('confidence').value]+' keyakinan':'Semua tingkat',...($('search').value.trim()?['Pencarian: '+$('search').value.trim()]:[])].join(' · ');
}
document.addEventListener('DOMContentLoaded',()=>{
 $('resetFilters').onclick=()=>{state.selectedVillage=null;state.page=0;$('district').value='';$('date').value='24h';$('regencyDate').value='24h';$('confidence').value='';$('search').value='';render();renderRegions();};
 document.addEventListener('click',async e=>{const b=e.target.closest('[data-retry]');if(!b)return;b.disabled=true;const actions={hotspots:refresh,regions:refresh,villages:loadVillagePM,daily:loadDaily,air:air,weather:weather};try{await actions[b.dataset.retry]?.();}finally{if(b.isConnected)b.disabled=false;}});
 for(const id of ['chart','dailyChart','rainChart']){
  const host=$(id),tip=document.createElement('div');tip.className='chart-tooltip';tip.role='status';tip.hidden=true;document.body.append(tip);
  const hide=()=>{tip.hidden=true;};
  const show=e=>{const target=e.target.closest('rect');if(!target||!host.contains(target))return;const title=target.querySelector('title');const text=target.dataset.tooltip||title?.textContent;if(!text)return;if(title){target.dataset.tooltip=text;target.setAttribute('aria-label',text);title.remove();}tip.textContent=text;tip.hidden=false;const r=target.getBoundingClientRect();const x=e.clientX||r.left+r.width/2,y=e.clientY||r.top;tip.style.left=Math.max(8,Math.min(window.innerWidth-tip.offsetWidth-8,x+10))+'px';tip.style.top=Math.max(8,Math.min(window.innerHeight-tip.offsetHeight-8,y-tip.offsetHeight-10))+'px';};
  host.addEventListener('pointerover',show);host.addEventListener('click',show);host.addEventListener('focusin',show);host.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')hide();});host.addEventListener('focusout',hide);document.addEventListener('click',e=>{if(!host.contains(e.target))hide();});window.addEventListener('scroll',hide,{passive:true});document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
 }
 setInterval(updateFreshness,60000);
});
