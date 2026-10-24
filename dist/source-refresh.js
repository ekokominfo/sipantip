/* Explicit visitor refresh. Automatic reads continue to use the shared cache. */
(function(scope){
 'use strict';

 let pending=null,lastAttempt=0;
 const invalid=()=>Object.assign(new Error('Respons sumber tidak valid.'),{kind:'invalid'});
 function validHotspot(j){
  if(!Array.isArray(j?.data?.features)||!Number.isFinite(Date.parse(j.generated_at))||(j.statusCode!==undefined&&Number(j.statusCode)!==200))throw invalid();
  for(const f of j.data.features){const c=f.geometry?.coordinates;if(!f.properties||!Array.isArray(c)||!Number.isFinite(c[0])||!Number.isFinite(c[1])||Math.abs(c[0])>180||Math.abs(c[1])>90)throw invalid();}
  return j;
 }
 function validModel(j,fields,forecast=false,current=false){
  const h=j?.hourly;
  if(j?.utc_offset_seconds!==25200||!Array.isArray(h?.time)||!h.time.length||!h.time.every((t,i)=>/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(t)&&Number.isFinite(Date.parse(t+'+07:00'))&&(!i||t>h.time[i-1])))throw invalid();
  const now=Date.now(),indices=h.time.map((t,i)=>forecast||Date.parse(t+'+07:00')<=now?i:-1).filter(i=>i>=0);
  if(!indices.length||(forecast&&!h.time.some(t=>Date.parse(t+'+07:00')>now)))throw invalid();
  const hourly={time:indices.map(i=>h.time[i])};
  for(const field of fields){if(!Array.isArray(h[field])||h[field].length!==h.time.length)throw invalid();hourly[field]=indices.map(i=>h[field][i]);if(!hourly[field].some(Number.isFinite)||hourly[field].some(v=>v!==null&&(!Number.isFinite(v)||v<0||(field==='precipitation_probability'&&v>100))))throw invalid();}
  if(current){const c=j.current;if(!c||!Number.isFinite(c.wind_speed_10m)||c.wind_speed_10m<0||!Number.isFinite(c.wind_direction_10m)||!Number.isFinite(c.cloud_cover)||!Number.isFinite(Date.parse(c.time+'+07:00'))||Date.parse(c.time+'+07:00')>now)throw invalid();}
  return {...j,hourly,collectedAt:new Date().toISOString()};
 }
 async function collect(){
  const cache=scope.CachedData,el=scope.document?.getElementById('refreshResult'),blocked=new Set();let success=0,failed=0,hotspotOK=0,done=0;
  function report(text,error=false){if(el){el.textContent=text;el.dataset.error=String(error);}}
  report('Mengambil data terbaru dari sumber…');
  async function request(url,provider){
   if(blocked.has(provider))throw Object.assign(new Error('quota'),{kind:'quota'});
   let r;try{r=await scope.fetch(url,{cache:'no-store',signal:AbortSignal.timeout(30000)});}catch{throw Object.assign(new Error('network'),{kind:'network'});}
   if(!r.ok){if(r.status===429)blocked.add(provider);throw Object.assign(new Error('HTTP '+r.status),{kind:r.status===429?'quota':'upstream'});}
   try{return await r.json();}catch{throw invalid();}
  }
  async function resource(key,fn){try{const {data,time}=await fn();cache.publishSource(key,data,time);success++;if(key.startsWith('hotspot-'))hotspotOK++;}catch(e){cache.failSource(key,e);failed++;}finally{done++;report('Mengambil dari sumber… '+done+' kelompok data diperiksa.');}}
  // Small batches and a per-tab cooldown avoid a burst of requests on repeated clicks.
  let directPromise;const directFeeds=()=>directPromise||(directPromise=request(scope.SiPongiSource.url(),'hotspot').then(j=>scope.SiPongiSource.normalize(j)));
  for(const level of ['High','Medium','Low'])await resource('hotspot-'+level,async()=>{const data=(await directFeeds())[level];return {data,time:data.generated_at};});
  const current=new Date(),days=[new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(+current-86400000)),new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(current)];
  for(const month of [...new Set(days.map(d=>d.slice(0,7)))])await resource('archive-'+month,async()=>{const rows=scope.SiPongiSource.recentArchive(await directFeeds(),current),old=await cache.get('archive-'+month).catch(()=>({}));return {data:{...old,...Object.fromEntries(Object.entries(rows).filter(([day])=>day.startsWith(month)))},time:current.toISOString()};});
  await resource('archive-index',async()=>{await directFeeds();const old=await cache.get('archive-index').catch(()=>({}));return {data:{...old,hotspot:[...new Set([...(old.hotspot||[]),...days])].sort(),diperbarui:current.toISOString(),recentCoverage:days},time:current.toISOString()};});
  const modelURL=(provider,points,params)=>provider+'?latitude='+points.map(p=>p.lat.toFixed(4)).join(',')+'&longitude='+points.map(p=>p.lon.toFixed(4)).join(',')+'&'+params+'&timezone=Asia%2FJakarta';
  const main={key:'main',lat:-2.75,lon:114.25};
  let villages=[];try{villages=(await cache.get('air-villages')).points||[];}catch{}
  async function modelGroup(key,points,provider,params,fields,forecast=false,current=false){
   await resource(key,async()=>{if(!points.length)throw invalid();const rows=[];let issue=null;for(let i=0;i<points.length;i+=20){const batch=points.slice(i,i+20);try{let models=await request(modelURL(provider,batch,params),provider);if(!Array.isArray(models))models=[models];for(let k=0;k<batch.length;k++)rows.push({...batch[k],...validModel(models[k],fields,forecast,current)});}catch(e){issue=e;break;}}
    // Publish complete groups only; retained village data must not be relabeled as fresh.
    if(issue||rows.length!==points.length)throw issue||invalid();
    const data=key.endsWith('-villages')?{points:rows}:key==='weather-grid'?rows:rows[0],time=forecast?data.collectedAt||rows[0].collectedAt:rows[0].current?.time?rows[0].current.time+'+07:00':rows[0].hourly.time.at(-1)+'+07:00';return {data,time};});
  }
  const air='https://air-quality-api.open-meteo.com/v1/air-quality',weather='https://api.open-meteo.com/v1/forecast';
  const airParams='hourly=pm2_5,us_aqi&past_days=1&forecast_days=1',weatherParams='current=wind_speed_10m,wind_direction_10m,cloud_cover&hourly=precipitation,visibility&past_days=1&forecast_days=1',rainParams='hourly=precipitation_probability,precipitation,visibility&past_days=1&forecast_days=3';
  await modelGroup('air-main',[main],air,airParams,['pm2_5','us_aqi']);
  await modelGroup('air-villages',villages,air,airParams,['pm2_5','us_aqi']);
  await modelGroup('weather-main',[main],weather,weatherParams,['precipitation','visibility'],false,true);
  const grid=[];for(const lat of [-1.4,-1.9,-2.4,-2.9,-3.4])for(const lon of [113.5,113.85,114.2,114.55])grid.push({lat,lon});
  await modelGroup('weather-grid',grid,weather,weatherParams,['precipitation','visibility'],false,true);
  await modelGroup('forecast-main',[main],weather,rainParams,['precipitation_probability','precipitation','visibility'],true);
  await modelGroup('forecast-villages',villages,weather,rainParams,['precipitation_probability','precipitation','visibility'],true);
  const text=(hotspotOK===3?'Titik panas berhasil diambil dari sumber. ':hotspotOK?'Sebagian feed titik panas gagal. ':'Sumber titik panas gagal dihubungi. ')+success+' kelompok data berhasil'+(failed?', '+failed+' gagal; data terakhir dipertahankan.':'.')+' Waktu pengambilan dan waktu deteksi ditampilkan terpisah.';
  report(text,failed>0);return {success,failed,hotspotOK};
 }
 async function run(){if(pending)return pending;if(lastAttempt&&Date.now()-lastAttempt<60000)throw new Error('Tunggu satu menit sebelum mengambil ulang dari sumber.');lastAttempt=Date.now();pending=collect();try{return await pending;}finally{pending=null;}}
 const api={run,validHotspot,validModel};scope.SourceRefresh=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
