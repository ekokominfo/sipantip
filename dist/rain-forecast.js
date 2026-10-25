(function(scope){
 'use strict';
 const hour=3600000;
 const number=(v,max=Infinity)=>Number.isFinite(v)&&v>=0&&v<=max?v:null;
 function rows(data,now=Date.now()){
  const h=data?.hourly;if(!Array.isArray(h?.time))throw Error('Prakiraan belum tersedia.');
  return h.time.map((time,i)=>({time,end:Date.parse(time+'+07:00'),probability:number(h.precipitation_probability?.[i],100),amount:number(h.precipitation?.[i])})).filter(r=>r.end>now&&r.end<=now+24*hour);
 }
 function summary(list){const p=list.map(r=>r.probability).filter(Number.isFinite);return {peak:p.length?Math.max(...p):null,wet:list.find(r=>r.amount!==null&&r.amount>=.1),complete:list.length===24&&list.every(r=>r.amount!==null&&r.probability!==null)};}
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
 if(typeof module!=='undefined')module.exports={rows,summary,hourlyRows,detectionStamp,rainBrief};
 if(!scope.document)return;
 const $=id=>document.getElementById(id),num=v=>v===null?'Belum tersedia':v.toLocaleString('id-ID',{maximumFractionDigits:1});
 const stamp=t=>new Date(t).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+' WIB';
 let busy=false,main=null,points=[];
 const clock=t=>new Date(t).toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'})+' WIB';
 function interval(r){return clock(r.end-hour).replace(' WIB','')+'–'+clock(r.end);}
 function villageHTML(key){const data=points.find(p=>p.key===key),s=rainBrief(data),v=WeatherUI.visibilityAt(data),info=WeatherUI.visibilityInfo(v?.meters);return '<span class="village-rain-line">'+(s.peak===null?'Prakiraan hujan belum tersedia':'Peluang hujan hingga '+'<strong>'+num(s.peak)+'%</strong>')+'</span><span class="village-visibility">Estimasi jarak pandang: '+(info?'<strong>'+num(info.value)+' '+info.unit+'</strong> · <strong style="color:'+info.color+'">'+info.label+'</strong>':'belum tersedia')+'</span>';}
 function updateCards(){const s=rainBrief(main);$('forecastChance').textContent=s.peak===null?'—':num(s.peak)+'%';$('forecastCondition').textContent=s.wet?'Hujan sekitar '+interval(s.wet):s.complete?'Tidak diperkirakan hujan dalam 24 jam':'Prakiraan belum tersedia';$('forecastTime').textContent=WeatherUI.updateText(main?.collectedAt);for(const el of document.querySelectorAll('[data-rain-village]'))el.innerHTML=villageHTML(el.dataset.rainVillage);}
 scope.RainForecast={villageHTML,load};
 function render(){
  const data=main,host=$('rainChart'),forecast=false;updateCards();$('rainTitle').textContent=forecast?'Prakiraan hujan · 24 jam ke depan':'Peluang hujan & titik panas · 24 jam terakhir';$('hotspotChartLegend').hidden=forecast;$('rainGuide').textContent=forecast?'Garis biru putus-putus: prakiraan hujan per jam di Kahayan Hilir. Titik panas tidak diprakirakan. Sentuh atau sorot titik untuk rincian.':'24 jam terakhir: garis merah utuh menunjukkan deteksi titik panas Pulang Pisau (sumbu kiri). Garis biru titik-titik menunjukkan peluang hujan model di Kahayan Hilir (sumbu kanan, %). Nilai 0 berarti tidak ada pada jam yang tercakup data; area abu-abu menunggu feed titik panas. Sentuh atau sorot grafik untuk rincian. Sumber: Open-Meteo dan NASA FIRMS.';
  const records=typeof state==='undefined'?[]:state.raw.filter(r=>(!$('confidence').value||r.level===$('confidence').value));
  const sourceTimes=typeof state==='undefined'?[]:(state.sourceDates||[]).map(Date.parse).filter(Number.isFinite);
  const list=hourlyRows(data,records,{future:false,loaded:typeof state!=='undefined'&&state.loaded,coverageEnd:sourceTimes.length?Math.min(...sourceTimes):0});
  const width=Math.max(320,Math.round(host.clientWidth||600)),left=45,right=width-45,top=35,bottom=210,height=250;
  const maxRain=100,maxHot=Math.max(2,Math.ceil(Math.max(...list.map(r=>r.hotspots||0))*1.1/2)*2);
  const x=i=>left+i/23*(right-left),yr=v=>bottom-v/maxRain*(bottom-top),yh=v=>bottom-v/maxHot*(bottom-top);
  const missing=list.map((r,i)=>!forecast&&r.hotspots===null?`<rect x="${Math.max(left,x(i)-(right-left)/46)}" y="${top}" width="${Math.min(right,x(i)+(right-left)/46)-Math.max(left,x(i)-(right-left)/46)}" height="${bottom-top}" fill="#94a3b826"/>`:'').join('');
  const ticks=[0,.5,1].map(f=>`<line x1="${left}" y1="${bottom-f*(bottom-top)}" x2="${right}" y2="${bottom-f*(bottom-top)}" stroke="#e6ebe2"/><text x="${left-7}" y="${bottom-f*(bottom-top)+4}" text-anchor="end" fill="#c4414d" font-size="11">${num(maxHot*f)}</text><text x="${right+7}" y="${bottom-f*(bottom-top)+4}" fill="#2563b6" font-size="11">${num(maxRain*f)}%</text>`).join('');
  const past=list.map(r=>({...r,probability:r.future?null:r.probability})),future=list.map(r=>({...r,probability:r.future?r.probability:null}));
  const paths=`<path d="${pathFor(past,'probability',x,yr)}" fill="none" stroke="#2563b6" stroke-width="2.5" stroke-dasharray="1 6" stroke-linecap="round"/><path d="${pathFor(future,'probability',x,yr)}" fill="none" stroke="#2563b6" stroke-width="2.5" stroke-dasharray="6 4"/><path d="${pathFor(list,'hotspots',x,yh)}" fill="none" stroke="#c4414d" stroke-width="2.5"/>`;
  const dots=list.map((r,i)=>(r.probability===null?'':`<circle cx="${x(i)}" cy="${yr(r.probability)}" r="2.5" fill="#2563b6"/>`)+(r.hotspots===null?'':`<circle cx="${x(i)}" cy="${yh(r.hotspots)}" r="2" fill="#c4414d"/>`)).join('');
  const hit=list.map((r,i)=>{const title=stamp(r.end)+' · '+'Peluang hujan model: '+num(r.probability)+(r.probability===null?'':'%')+' · Titik panas: '+(r.future?'Belum tersedia (waktu mendatang)':num(r.hotspots));return `<rect x="${i?((x(i-1)+x(i))/2):left}" y="${top}" width="${(right-left)/23}" height="${bottom-top}" fill="transparent" tabindex="0" role="button" data-tooltip="${esc(title)}" aria-label="${esc(title)}"/>`;}).join('');
  const labels=[0,12,23].map(i=>`<text x="${x(i)}" y="239" text-anchor="${i===0?'start':i===23?'end':'middle'}" fill="#78867e" font-size="11">${esc(new Date(list[i].end).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}))}</text>`).join('');
  host.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="group" aria-label="Grafik hujan dan deteksi titik panas per jam, rentang 24 jam"><text x="${left}" y="16" fill="#c4414d" font-size="11">deteksi/jam</text><text x="${right}" y="16" text-anchor="end" fill="#2563b6" font-size="11">peluang hujan (%)</text>${missing}${ticks}${paths}${dots}${hit}${labels}</svg>`;
  const rainMissing=list.filter(r=>r.probability===null).length,hotMissing=list.filter(r=>r.hotspots===null).length;
  $('missingChartLegend').hidden=hotMissing===0;
  $('rainStatus').textContent=(rainMissing?'Peluang hujan: '+rainMissing+' dari 24 jam belum tersedia. ':'')+(!forecast&&hotMissing?'Area abu-abu: '+hotMissing+' jam data titik panas belum tersedia (bukan nol deteksi)'+(sourceTimes.length?' (feed hingga '+stamp(Math.min(...sourceTimes))+')':'')+'.':'');
 }
 async function load(){
  if(busy)return;busy=true;$('rain-section').setAttribute('aria-busy','true');
  try{
    const results=await Promise.allSettled([scope.CachedData.get('forecast-main'),scope.CachedData.get('forecast-villages')]);if(results[0].status==='fulfilled')main=results[0].value;if(results[1].status==='fulfilled')points=results[1].value.points||[];

  }catch(e){/* Keep the last valid local snapshot and its original timestamp. */}
  finally{busy=false;render();$('rain-section').setAttribute('aria-busy','false');}
 }
 document.addEventListener('sipantip:hotspots',render);
 let frame;addEventListener('resize',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(render);});setInterval(()=>{if(!document.hidden)render();},60000);setInterval(()=>{if(!document.hidden)load();},600000);load();
})(typeof window!=='undefined'?window:globalThis);
