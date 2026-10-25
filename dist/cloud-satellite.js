(function(scope){
 'use strict';
 const LAYER='Himawari_AHI_Band13_Clean_Infrared',ENDPOINT='https://gibs.earthdata.nasa.gov/';
 function frameTimes(domain,now=Date.now()){
  const available=new Set();
  for(const part of String(domain).split(',')){const [a,b,d]=part.trim().split('/'),start=Date.parse(a),end=b?Date.parse(b):start,minutes=/^PT(\d+)M$/.exec(d||'PT10M'),step=minutes?Number(minutes[1])*60000:0;if(!Number.isFinite(start)||!Number.isFinite(end)||!step||end<start)continue;const from=Math.max(0,Math.ceil((now-6*3600000-start)/step)),to=Math.min(Math.floor((Math.min(now,end)-start)/step),from+1000);for(let i=from;i<=to;i++)available.add(start+i*step);}
  const all=[...available].sort((a,b)=>a-b),last=all.at(-1);if(last===undefined)return [];const chosen=all.filter(t=>t>=last-2*3600000);return chosen.filter((t,i)=>i===chosen.length-1||(last-t)%(20*60000)===0).slice(-7).map(t=>new Date(t).toISOString().replace('.000Z','Z'));
 }
 // GIBS DescribeDomains requires literal ISO separators in TIME (encoded colons/slash return HTTP 400).
 function domainURL(now=Date.now()){now=Math.floor(now/600000)*600000;const iso=t=>new Date(t).toISOString().replace('.000Z','Z');return ENDPOINT+'wmts/epsg3857/best/wmts.cgi?'+new URLSearchParams({SERVICE:'WMTS',REQUEST:'DescribeDomains',VERSION:'1.0.0',LAYER,TILEMATRIXSET:'GoogleMapsCompatible_Level6'})+'&TIME='+iso(now-6*3600000)+'/'+iso(now);}
 const bounds=[[-4.6,108.3],[7.6,119.6]];
 function imageURL(time){const merc=([lat,lon])=>[lon*20037508.342789244/180,Math.log(Math.tan((90+lat)*Math.PI/360))*6378137],sw=merc(bounds[0]),ne=merc(bounds[1]);return ENDPOINT+'wms/epsg3857/best/wms.cgi?'+new URLSearchParams({SERVICE:'WMS',REQUEST:'GetMap',VERSION:'1.1.1',LAYERS:LAYER,STYLES:'',FORMAT:'image/png',TRANSPARENT:'TRUE',SRS:'EPSG:3857',BBOX:[...sw,...ne].join(','),WIDTH:'768',HEIGHT:'832',TIME:time});}
 const api={frameTimes,domainURL,imageURL};scope.SatelliteCloud=api;if(typeof module!=='undefined')module.exports=api;
 if(typeof document==='undefined')return;
 const el=id=>document.getElementById(id),ui={enabled:false,busy:false,playing:!matchMedia('(prefers-reduced-motion: reduce)').matches,visible:true,moving:false,frames:[],index:0,timer:null,checked:0,opacity:.55,controller:null,sequence:0};
 function pauseTimer(){clearTimeout(ui.timer);ui.timer=null;}
 function status(text){el('cloudStatus').textContent=text;}
 function show(index){if(!ui.frames.length)return;ui.index=index;ui.frames.forEach((f,i)=>f.layer.setOpacity(ui.enabled&&i===index?ui.opacity:0));const f=ui.frames[index],time=Date.parse(f.time);el('cloudTime').textContent=new Date(time).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})+' WIB';el('cloudFrame').value=String(index);el('cloudFrame').setAttribute('aria-valuetext',el('cloudTime').textContent);status((ui.frames.length<2?'Satu citra tersedia':(index+1)+' / '+ui.frames.length+' citra')+(Date.now()-time>3*3600000?' · citra lebih dari 3 jam':'')+(ui.busy?' · memperbarui…':''));}
 function schedule(){pauseTimer();el('cloudPlay').textContent=ui.playing?'Jeda':'Putar';el('cloudPlay').setAttribute('aria-pressed',String(ui.playing));if(!ui.enabled||!ui.playing||document.hidden||!ui.visible||ui.moving||ui.frames.length<2)return;ui.timer=setTimeout(()=>{show((ui.index+1)%ui.frames.length);schedule();},ui.index===ui.frames.length-1?1800:800);}
 function release(frames){for(const f of frames){state.map?.removeLayer(f.layer);URL.revokeObjectURL(f.url);}}
 async function load(){
  if(ui.busy||!ui.enabled||!state.map)return;ui.busy=true;const sequence=++ui.sequence;ui.controller=new AbortController();const signal=ui.controller.signal;const fresh=[];status('Memuat waktu citra NASA GIBS…');el('cloudRetry').hidden=true;
  try{
   const response=await fetch(domainURL(),{signal:AbortSignal.any([signal,AbortSignal.timeout(15000)])});if(!response.ok)throw Error();const doc=new DOMParser().parseFromString(await response.text(),'application/xml'),domain=doc.getElementsByTagName('Domain')[0]?.textContent,times=frameTimes(domain);if(!times.length)throw Error();
   if(!state.map.getPane('satelliteCloud')){state.map.createPane('satelliteCloud');state.map.getPane('satelliteCloud').style.zIndex=340;state.map.getPane('satelliteCloud').style.pointerEvents='none';}
   let next=0;
   async function worker(){while(next<times.length){const time=times[next++];let url;
    try{const r=await fetch(imageURL(time),{signal:AbortSignal.any([signal,AbortSignal.timeout(15000)])});if(!r.ok||!r.headers.get('content-type')?.includes('image/'))continue;const blob=await r.blob();if(blob.size<512)continue;url=URL.createObjectURL(blob);const image=new Image();image.src=url;await image.decode();if(signal.aborted){URL.revokeObjectURL(url);return;}fresh.push({time,url,layer:L.imageOverlay(url,bounds,{pane:'satelliteCloud',opacity:0,interactive:false,attribution:'Himawari-9 / JMA · <a href="https://www.earthdata.nasa.gov/data/tools/gibs" target="_blank" rel="noopener">NASA GIBS</a>'})});status('Memuat citra awan '+fresh.length+' / '+times.length+'…');}
    catch{if(url)URL.revokeObjectURL(url);if(signal.aborted)return;}
   }}
   await Promise.all([worker(),worker()]);if(sequence!==ui.sequence||!ui.enabled){release(fresh);return;}if(!fresh.length)throw Error();
   release(ui.frames);ui.frames=fresh.sort((a,b)=>a.time.localeCompare(b.time));ui.frames.forEach(f=>f.layer.addTo(state.map));ui.checked=Date.now();el('cloudFrame').max=String(ui.frames.length-1);el('cloudFrame').disabled=ui.frames.length<2;el('cloudPlay').disabled=ui.frames.length<2;ui.busy=false;show(ui.frames.length-1);schedule();
  }catch(error){console.warn('Satellite cloud loading failed:',error);release(fresh);if(sequence===ui.sequence&&ui.enabled){status(ui.frames.length?'Pembaruan gagal · menampilkan citra terakhir':'Citra awan belum dapat dimuat. Coba lagi.');el('cloudRetry').hidden=false;}}
  finally{if(sequence===ui.sequence)ui.busy=false;}
 }
 function toggle(enabled){ui.enabled=enabled;el('cloudControls').hidden=!enabled;pauseTimer();if(!enabled){ui.sequence++;ui.controller?.abort();ui.busy=false;release(ui.frames);ui.frames=[];return;}el('cloudPlay').disabled=true;el('cloudFrame').disabled=true;if(state.map&&state.map.getZoom()>8)state.map.setZoom(8,{animate:false});load();}
 api.toggle=toggle;
 el('cloudPlay').onclick=()=>{ui.playing=!ui.playing;schedule();};el('cloudFrame').oninput=e=>{ui.playing=false;show(Number(e.target.value));schedule();};el('cloudOpacity').oninput=e=>{ui.opacity=1-Number(e.target.value)/100;show(ui.index);};el('cloudRetry').onclick=load;
 document.addEventListener('visibilitychange',schedule);new IntersectionObserver(entries=>{ui.visible=entries[0].isIntersecting;schedule();}).observe(document.querySelector('.map-stage'));
 function connect(){if(!state.map)return;state.map.on('movestart',()=>{ui.moving=true;schedule();});state.map.on('moveend',()=>{ui.moving=false;schedule();});}
 connect();setInterval(()=>{if(ui.enabled&&!document.hidden&&Date.now()-ui.checked>10*60000)load();},60000);
})(typeof window!=='undefined'?window:globalThis);
