'use strict';
(function(root){
 // EPA AQI Technical Assistance Document, May 2026, section IV.
 // Apply PM NowCast to hourly model concentrations; this is not a sensor observation.
 function hourStamp(value){
  const stamp=String(value||'').trim().replace(' ','T');
  return stamp?Date.parse(stamp+(/[zZ]$|[+-]\d{2}:\d{2}$/.test(stamp)?'':'+07:00')):NaN;
 }
 function calculate(hourly,index){
  if(!hourly||!Number.isInteger(index))return null;
  const end=hourStamp(hourly.time?.[index]);if(!Number.isFinite(end))return null;
  const hours=new Map();
  for(let i=0;i<=index;i++){
   const age=(end-hourStamp(hourly.time?.[i]))/3600000,value=hourly.pm2_5?.[i];
   if(Number.isInteger(age)&&age>=0&&age<12&&Number.isFinite(value)&&value>=0)hours.set(age,value);
  }
  if([0,1,2].filter(age=>hours.has(age)).length<2)return null;
  const values=[...hours.values()],maximum=Math.max(...values),minimum=Math.min(...values);
  const weight=maximum===0?1:Math.max(.5,minimum/maximum);
  let sum=0,weights=0;for(const [age,value]of hours){const w=weight**age;sum+=value*w;weights+=w;}
  // Truncate PM2.5 to one decimal before applying EPA's 2024 breakpoints.
  const concentration=Math.floor((sum/weights)*10)/10;
  const band=concentration<=9?0:concentration<=35.4?1:concentration<=55.4?2:concentration<=125.4?3:concentration<=225.4?4:5;
  return {concentration,band,label:['Baik','Sedang','Tidak sehat bagi kelompok sensitif','Tidak sehat','Sangat tidak sehat','Berbahaya'][band],hours:hours.size};
 }
 function render(hourly,index){
  const label=root.document?.getElementById('pmCategory'),card=label?.closest('.pm-card');if(!card)return;
  const result=calculate(hourly,index);card.dataset.pmBand=result?String(result.band):'unknown';
  label.textContent=result?result.label:'Kategori belum tersedia';
 }
 const api={calculate,render};root.PMNowcast=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
