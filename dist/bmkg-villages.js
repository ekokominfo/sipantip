/* Shared BMKG validation and village-card rendering. */
(function(scope){
 'use strict';
 function normalizeBMKG(j,code,now=new Date()){
  if(j?.lokasi?.adm4!==code||!Array.isArray(j.data?.[0]?.cuaca))throw new Error('Invalid BMKG location');
  const rows=j.data[0].cuaca.flat().map(r=>{const start=Date.parse(r.utc_datetime?.replace(' ','T')+'Z'),produced=Date.parse(r.analysis_date+'Z');if(!Number.isFinite(start)||!Number.isFinite(produced)||produced>+now+300000||typeof r.weather_desc!=='string'||!r.weather_desc.trim())throw new Error('Invalid BMKG forecast');return {start:new Date(start).toISOString(),producedAt:new Date(produced).toISOString(),description:r.weather_desc.trim()};}).sort((a,b)=>a.start.localeCompare(b.start));
  if(!rows.length||!rows.some(r=>Date.parse(r.start)+10800000>+now))throw new Error('Expired BMKG forecast');
  return rows;
 }
 function selectBMKG(point,now=Date.now()){
  const rows=point?.forecasts||[],current=rows.find(r=>Date.parse(r.start)<=now&&now<Date.parse(r.start)+10800000);
  return current||rows.find(r=>Date.parse(r.start)>now&&Date.parse(r.start)-now<=10800000)||null;
 }
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function cardHTML(point,now=Date.now()){
  const r=selectBMKG(point,now);if(!r)return '<span class="village-bmkg"><b>Cuaca BMKG: Belum tersedia</b></span>';
  const stamp=new Date(r.start).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  return '<span class="village-bmkg"><b>Prakiraan BMKG: '+escape(r.description)+'</b><span>Berlaku '+escape(stamp)+' WIB</span></span>';
 }
 const api={normalizeBMKG,selectBMKG,cardHTML};scope.BMKGVillages=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
