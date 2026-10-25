(function(scope){
 'use strict';
 const hour=3600000;
 const number=(v,max=Infinity)=>Number.isFinite(v)&&v>=0&&v<=max?v:null;
 function rows(data,now=Date.now()){
  const h=data?.hourly;if(!Array.isArray(h?.time))throw Error('Prakiraan belum tersedia.');
  return h.time.map((time,i)=>({time,end:Date.parse(time+'+07:00'),probability:number(h.precipitation_probability?.[i],100),amount:number(h.precipitation?.[i])})).filter(r=>r.end>now&&r.end<=now+24*hour);
 }
 function summary(list){const p=list.map(r=>r.probability).filter(Number.isFinite),peak=p.length?Math.max(...p):null;return {peak,peakAt:peak===null?null:list.find(r=>r.probability===peak),wet:list.find(r=>r.amount!==null&&r.amount>=.1),complete:list.length===24&&list.every(r=>r.amount!==null&&r.probability!==null)};}
 function rainBrief(data,now=Date.now()){
  if(!data?.hourly)return {peak:null,total:null,wet:null,complete:false};const list=rows(data,now),result=summary(list);return {...result,total:list.length===24&&list.every(r=>r.amount!==null)?list.reduce((n,r)=>n+r.amount,0):null};
 }
 function detectionStamp(s){let t=String(s||'').replace(' WIB','').replace(' ','T');if(!/([zZ]|[+-]\d\d:\d\d)$/.test(t))t+='+07:00';return Date.parse(t);}
 function hourlyRows(data,records=[],options={}){
  const now=options.now??Date.now(),base=Math.floor(now/hour)*hour,h=data?.hourly,lookup=new Map((h?.time||[]).map((t,i)=>[Date.parse(t+'+07:00'),i]));
  const counts=new Map();for(const r of records){const t=detectionStamp(r.when);if(!Number.isFinite(t)||t>now)continue;const end=(Math.floor(t/hour)+1)*hour;counts.set(end,(counts.get(end)||0)+1);}
  const coverageEnd=options.coverageEnd??now,coverageStart=coverageEnd-24*hour;
  return Array.from({length:24},(_,i)=>{const end=base+(options.future?i+1:i-23)*hour,index=lookup.get(end),future=end>now;return {end,future,amount:index===undefined?null:number(h.precipitation?.[index]),probability:index===undefined?null:number(h.precipitation_probability?.[index],100),hotspots:future||!options.loaded?null:counts.has(end)?counts.get(end):end<=coverageEnd&&end-hour>=coverageStart?0:null};});
 }
 function pathFor(list,key,x,y){let active=false;return list.map((r,i)=>{if(r[key]===null){active=false;return '';}const p=(active?'L':'M')+x(i)+','+y(r[key]);active=true;return p;}).join(' ');}
 function headerRainForecast(data){return data?.points?.find(p=>p.key==='kahayanhilir|pulangpisau'&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat-(-2.751345))<.0001&&Math.abs(p.lon-114.2608442894562)<.0001)||null;}
 function rainSVG(list,width=600){
  const left=45,right=width-20,top=35,bottom=210,x=i=>left+i/23*(right-left),y=v=>bottom-v/100*(bottom-top),stamp=t=>new Date(t).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+' WIB';
  const ticks=[0,50,100].map(v=>`<line x1="${left}" y1="${y(v)}" x2="${right}" y2="${y(v)}" stroke="#e0e8f2"/><text x="${left-7}" y="${y(v)+4}" text-anchor="end" fill="#2563b6" font-size="11">${v}%</text>`).join('');
  const missing=list.map((r,i)=>r.probability===null?`<rect x="${Math.max(left,x(i)-(right-left)/46)}" y="${top}" width="${Math.min(right,x(i)+(right-left)/46)-Math.max(left,x(i)-(right-left)/46)}" height="${bottom-top}" fill="#94a3b826"/>`:'').join('');
  const line=`<path d="${pathFor(list,'probability',x,y)}" fill="none" stroke="#2563b6" stroke-width="2.5"/>`,dots=list.map((r,i)=>r.probability===null?'':`<circle cx="${x(i)}" cy="${y(r.probability)}" r="2.5" fill="#2563b6"/>`).join('');
  const hits=list.map((r,i)=>{const title=stamp(r.end)+' · Peluang hujan: '+(r.probability===null?'Belum tersedia':r.probability+'%');return `<rect x="${Math.max(left,x(i)-(right-left)/46)}" y="${top}" width="${Math.min(right,x(i)+(right-left)/46)-Math.max(left,x(i)-(right-left)/46)}" height="${bottom-top}" fill="transparent" tabindex="0" role="button" data-tooltip="${title}" aria-label="${title}"/>`;}).join('');
  const labels=[0,12,23].map(i=>`<text x="${x(i)}" y="239" text-anchor="${i===0?'start':i===23?'end':'middle'}" fill="#52677d" font-size="11">${stamp(list[i].end).replace(' WIB','')}</text>`).join('');
  return `<svg viewBox="0 0 ${width} 250" role="group" aria-label="Grafik peluang hujan per jam, 24 jam ke depan"><text x="${left}" y="16" fill="#2563b6" font-size="11">peluang hujan (%)</text>${missing}${ticks}${line}${dots}${hits}${labels}</svg>`;
 }
 function hotspotSVG(list,width=600){
  const left=45,right=width-20,top=35,bottom=210,height=250,max=Math.max(2,Math.ceil(Math.max(...list.map(r=>r.hotspots||0))*1.1/2)*2),x=i=>left+i/23*(right-left),y=v=>bottom-v/max*(bottom-top),num=n=>n.toLocaleString('id-ID',{maximumFractionDigits:1}),stamp=t=>new Date(t).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+' WIB';
  const missing=list.map((r,i)=>r.hotspots===null?`<rect x="${Math.max(left,x(i)-(right-left)/46)}" y="${top}" width="${Math.min(right,x(i)+(right-left)/46)-Math.max(left,x(i)-(right-left)/46)}" height="${bottom-top}" fill="#94a3b826"/>`:'').join('');
  const ticks=[0,.5,1].map(f=>`<line x1="${left}" y1="${bottom-f*(bottom-top)}" x2="${right}" y2="${bottom-f*(bottom-top)}" stroke="#e6ebe2"/><text x="${left-7}" y="${bottom-f*(bottom-top)+4}" text-anchor="end" fill="#c4414d" font-size="11">${num(max*f)}</text>`).join('');
  const path=`<path d="${pathFor(list,'hotspots',x,y)}" fill="none" stroke="#c4414d" stroke-width="2.5"/>`,dots=list.map((r,i)=>r.hotspots===null?'':`<circle cx="${x(i)}" cy="${y(r.hotspots)}" r="2.5" fill="#c4414d"/>`).join('');
  const hit=list.map((r,i)=>{const title='Hingga '+stamp(r.end)+' · Titik panas: '+(r.hotspots===null?'Belum tersedia':num(r.hotspots));return `<rect x="${Math.max(left,x(i)-(right-left)/46)}" y="${top}" width="${Math.min(right,x(i)+(right-left)/46)-Math.max(left,x(i)-(right-left)/46)}" height="${bottom-top}" fill="transparent" tabindex="0" role="button" data-tooltip="${title}" aria-label="${title}"/>`;}).join('');
  const labels=[0,12,23].map(i=>`<text x="${x(i)}" y="239" text-anchor="${i===0?'start':i===23?'end':'middle'}" fill="#78867e" font-size="11">${stamp(list[i].end).replace(' WIB','')}</text>`).join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="group" aria-label="Grafik deteksi titik panas per jam, 24 jam terakhir"><text x="${left}" y="16" fill="#c4414d" font-size="11">deteksi/jam</text>${missing}${ticks}${path}${dots}${hit}${labels}</svg>`;
 }
 if(typeof module!=='undefined')module.exports={rows,summary,hourlyRows,detectionStamp,rainBrief,hotspotSVG,rainSVG,headerRainForecast};
 if(!scope.document)return;
 const $=id=>document.getElementById(id),num=v=>v===null?'Belum tersedia':v.toLocaleString('id-ID',{maximumFractionDigits:1});
 const stamp=t=>new Date(t).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+' WIB';
 let busy=false,main=null,points=[];
 const clock=t=>new Date(t).toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'})+' WIB';
 function interval(r){return clock(r.end-hour).replace(' WIB','')+'–'+clock(r.end);}
 function villageHTML(key){const data=points.find(p=>p.key===key),s=rainBrief(data),v=WeatherUI.visibilityAt(data),info=WeatherUI.visibilityInfo(v?.meters);return '<span class="village-rain-line">'+(s.peak===null?'Prakiraan hujan belum tersedia':'Peluang hujan hingga '+'<strong>'+num(s.peak)+'%</strong>')+'</span><span class="village-visibility">Estimasi jarak pandang: '+(info?'<strong>'+num(info.value)+' '+info.unit+'</strong> · <strong style="color:'+info.color+'">'+info.label+'</strong>':'belum tersedia')+'</span>';}
 function updateCards(){const s=rainBrief(main);$('forecastChance').textContent=s.peak===null?'—':num(s.peak)+'%';$('forecastCondition').textContent=s.peakAt?'Puncak sekitar '+stamp(s.peakAt.end):'Prakiraan belum tersedia';$('forecastTime').textContent=WeatherUI.updateText(main?.collectedAt);for(const el of document.querySelectorAll('[data-rain-village]'))el.innerHTML=villageHTML(el.dataset.rainVillage);}
 scope.RainForecast={villageHTML,load};
 function render(){
  const host=$('rainChart');updateCards();$('rainTitle').textContent='Titik panas · 24 jam terakhir';$('hotspotChartLegend').hidden=false;$('rainGuide').textContent='Deteksi titik panas Pulang Pisau per jam selama 24 jam terakhir, sesuai filter kepercayaan. Area abu-abu menandakan feed belum tersedia, bukan nol deteksi. Sentuh atau sorot grafik untuk rincian. Sumber: NASA FIRMS.';
  const records=typeof state==='undefined'?[]:state.raw.filter(r=>(!$('confidence').value||r.level===$('confidence').value)),sourceTimes=typeof state==='undefined'?[]:(state.sourceDates||[]).map(Date.parse).filter(Number.isFinite);
  const list=hourlyRows(null,records,{future:false,loaded:typeof state!=='undefined'&&state.loaded,coverageEnd:sourceTimes.length?Math.min(...sourceTimes):0});
  host.innerHTML=hotspotSVG(list,Math.max(320,Math.round(host.clientWidth||600)));
  const missing=list.filter(r=>r.hotspots===null).length;$('missingChartLegend').hidden=missing===0;
  $('rainStatus').textContent=missing?'Area abu-abu: '+missing+' jam data titik panas belum tersedia (bukan nol deteksi)'+(sourceTimes.length?' (feed hingga '+stamp(Math.min(...sourceTimes))+')':'')+'.':'';
  const rainHost=$('forecastRainChart'),forecast=hourlyRows(main,[],{future:true}),unavailable=forecast.filter(r=>r.probability===null).length;
  rainHost.innerHTML=rainSVG(forecast,Math.max(320,Math.round(rainHost.clientWidth||600)));
  $('forecastRainStatus').textContent=unavailable?'Prakiraan belum lengkap: '+unavailable+' jam belum tersedia. Area abu-abu bukan peluang hujan 0%.':'';
 }

 async function load(){
  if(busy)return;busy=true;$('rain-section').setAttribute('aria-busy','true');
  try{
    const data=await scope.CachedData.get('forecast-villages');points=data.points||[];main=headerRainForecast(data);

  }catch(e){/* Keep the last valid local snapshot and its original timestamp. */}
  finally{busy=false;render();$('rain-section').setAttribute('aria-busy','false');}
 }
 document.addEventListener('sipantip:hotspots',render);
 let frame;addEventListener('resize',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(render);});setInterval(()=>{if(!document.hidden)render();},60000);setInterval(()=>{if(!document.hidden)load();},600000);load();
})(typeof window!=='undefined'?window:globalThis);
