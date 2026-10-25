/* Only a publishable key belongs in analytics-config.js. Never add a service key. */
(() => {
  const config = window.SIPANTIP_ANALYTICS;
  const features = ['weather-section','peta-section','district-section','village-section','daily-section','rain-section','pm-section','data-section','regency-section','sources-section'];
  const uuid = () => crypto.randomUUID();
  const day = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function metadata(ua) {
    return {device:/iPad|Tablet/i.test(ua)?'Tablet':/Mobi|Android|iPhone/i.test(ua)?'Ponsel':'Desktop',
      browser:/Edg\//.test(ua)?'Edge':/Firefox|FxiOS/.test(ua)?'Firefox':/Chrome|CriOS/.test(ua)?'Chrome':/Safari/.test(ua)?'Safari':'Lainnya',
      os:/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iOS':/Windows/.test(ua)?'Windows':/Mac/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'Lainnya'};
  }
  function referrer(value) {try {const host=new URL(value).hostname.toLowerCase();return host===location.hostname?'internal':host.slice(0,120);}catch{return 'langsung';}}
  async function rpc(name,params={}) {
    const r=await fetch(config.url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify(params),keepalive:true,signal:AbortSignal.timeout(10000)});
    if(!r.ok)throw new Error('Statistik belum tersedia');
    return r.status===204?null:r.json();
  }
  // Reports are available in the admin dashboard only.
  if(navigator.doNotTrack==='1'||navigator.globalPrivacyControl||location.hostname!=='ekokominfo.github.io')return;
  if(!config?.key)return;
  let visitor, session, seen=new Set();
  const meta=metadata(navigator.userAgent);
  function identity(){
    const now=Date.now(),date=day();
    try{
      visitor=localStorage.getItem('sipantip.visitor')||uuid();localStorage.setItem('sipantip.visitor',visitor);
      let saved=JSON.parse(localStorage.getItem('sipantip.session')||'null');
      if(!saved||now-saved.last>1800000||saved.day!==date){saved={id:uuid(),day:date};seen=new Set();}
      saved.last=now;session=saved.id;localStorage.setItem('sipantip.session',JSON.stringify(saved));
    }catch{visitor=visitor||uuid();session=session||uuid();}
  }
  async function record(feature){
    identity();if(seen.has(session+feature))return;
    seen.add(session+feature);
    try{await rpc('record_visit',{p_visitor:visitor,p_session:session,p_device:meta.device,p_browser:meta.browser,p_os:meta.os,p_referrer:referrer(document.referrer),p_feature:feature});}
    catch{seen.delete(session+feature);}
  }
  record('pageview');
  // Only fixed action codes are sent: no search text, coordinates, or route URLs.
  const changed=new Map();
  for(const id of ['district','date','confidence']){const node=document.getElementById(id);if(node)changed.set(id,node.value);}
  document.addEventListener?.('focusin',event=>{const node=event.target;if(changed.has(node.id))changed.set(node.id,node.value);});
  const lastAction=new Map();let queue=Promise.resolve();
  function mapAction(action){
    const now=Date.now();if(now-(lastAction.get(action)||0)<500)return;lastAction.set(action,now);
    identity();const params={p_visitor:visitor,p_session:session,p_event:uuid(),p_action:action,p_device:meta.device,p_browser:meta.browser,p_os:meta.os,p_referrer:referrer(document.referrer)};
    queue=queue.then(()=>rpc('record_map_event',params)).catch(()=>{});
  }
  document.addEventListener?.('change',event=>{
    if(!event.isTrusted)return;const node=event.target,id=node.id;
    if(!changed.has(id)||changed.get(id)===node.value)return;
    changed.set(id,node.value);
    mapAction(id==='confidence'?'filter:confidence:'+(node.value||'all'):id==='district'?'filter:district':'filter:period');
  });
  document.addEventListener?.('submit',event=>{
    if(event.isTrusted&&event.target.id==='mapSearchForm'&&document.getElementById('mapSearch').value.trim())mapAction('search:map');
  });
  document.addEventListener?.('click',event=>{
    if(!event.isTrusted)return;const node=event.target.closest?.('button,a');if(!node)return;
    if(node.matches('[data-layer]')){
      // Capture phase observes the state before the map toggles the layer.
      if(node.getAttribute('aria-pressed')!=='true')mapAction('layer:'+node.dataset.layer);
      return;
    }
    const actions={locateMe:'location:request',clearMyLocation:'location:clear',resetMap:'map:focus',clearVillage:'filter:village:clear',resetFilters:'filter:reset'};
    if(actions[node.id])mapAction(actions[node.id]);
    else if(node.matches('[data-village]'))mapAction('filter:village');
    else if(node.matches('[data-nearby-mode]'))mapAction('nearby:'+node.dataset.nearbyMode);
    else if(node.closest('.nearby-result-actions'))mapAction(node.tagName==='A'?'route:open':'nearby:show');
  },true);
  document.addEventListener?.('sipantip:fullscreen',()=>mapAction('map:fullscreen'));
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)record(entry.target.id);},{threshold:0,rootMargin:'-20% 0px -20% 0px'});
  features.forEach(id=>{const element=document.getElementById(id);if(element)observer.observe(element);});
})();
