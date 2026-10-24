(function(scope){
 'use strict';
 const bands=[{limit:1000,label:'Sangat buruk',color:'#8b243c'},{limit:2000,label:'Buruk',color:'#d83d32'},{limit:5000,label:'Terbatas',color:'#dc7c19'},{limit:10000,label:'Cukup baik',color:'#88720c'},{limit:Infinity,label:'Baik',color:'#257b43'}];
 function visibilityInfo(m){
  if(!Number.isFinite(m)||m<0)return null;
  const i=bands.findIndex(b=>m<b.limit),lower=i?bands[i-1].limit:0,upper=i===4?20000:bands[i].limit;
  return {...bands[i],value:m<1000?Math.round(m):Math.round(m/100)/10,unit:m<1000?'m':'km',position:Math.min(100,i*20+Math.max(0,(m-lower)/(upper-lower))*20)};
 }
 function visibilityAt(data,now=Date.now()){
  const h=data?.hourly;let index=-1;
  for(let i=0;i<(h?.time?.length||0);i++){const t=Date.parse(h.time[i]+'+07:00');if(t<=now)index=i;}
  if(index<0||!visibilityInfo(h.visibility?.[index]))return null;
  return {meters:h.visibility[index],time:h.time[index]+':00+07:00'};
 }
 function updateText(time){const t=Date.parse(time);return Number.isFinite(t)?'Pembaruan terakhir '+new Date(t).toLocaleDateString('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'short',year:'numeric'})+' pukul '+new Date(t).toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'})+' WIB':'Pembaruan terakhir belum tersedia';}
 function generalUpdateText(time,now=Date.now()){
  const t=Date.parse(time);if(!Number.isFinite(t))return 'Pembaruan terakhir :\nBelum tersedia';
  const age=Math.max(0,now-t),minutes=Math.floor(age/60000),hours=Math.floor(age/3600000);
  const relative=minutes<1?'kurang dari 1 menit yang lalu':hours<1?'sekitar '+minutes+' menit yang lalu':'sekitar '+hours+' jam yang lalu';
  return 'Pembaruan terakhir :\n'+updateText(time).replace('Pembaruan terakhir ','')+'\n('+relative+')';
 }
 function renderVisibility(m,time){
  const $=id=>scope.document.getElementById(id),info=visibilityInfo(m),card=$('visibility').closest('.visibility-card');
  $('visibility').textContent=info?info.value.toLocaleString('id-ID'):'—';$('visibilityUnit').textContent=info?.unit||'km';$('visibilityLabel').textContent=info?.label||'Belum tersedia';
  card.style.setProperty('--visibility-color',info?.color||'#53677d');$('visibilityMarker').hidden=!info;if(info)$('visibilityMarker').style.left=info.position+'%';
  $('visibilityTime').textContent=updateText(time);$('visibilityScale').setAttribute('aria-label',info?'Jarak pandang '+info.value+' '+info.unit+', '+info.label:'Jarak pandang belum tersedia');
 }
 scope.WeatherUI={visibilityInfo,visibilityAt,generalUpdateText,updateText,renderVisibility};
 if(typeof module!=='undefined')module.exports={visibilityInfo,visibilityAt,generalUpdateText,updateText};
})(typeof window!=='undefined'?window:globalThis);
