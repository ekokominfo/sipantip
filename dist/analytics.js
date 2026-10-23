/* Only a publishable key belongs in analytics-config.js. Never add a service key. */
(() => {
  const config = window.SIPANTIP_ANALYTICS;
  const features = ['peta-section','district-section','village-section','daily-section','pm-section','data-section','regency-section'];
  const uuid = () => crypto.randomUUID();
  const day = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function metadata(ua) {
    return {device:/iPad|Tablet/i.test(ua)?'Tablet':/Mobi|Android|iPhone/i.test(ua)?'Ponsel':'Desktop',
      browser:/Edg\//.test(ua)?'Edge':/Firefox|FxiOS/.test(ua)?'Firefox':/Chrome|CriOS/.test(ua)?'Chrome':/Safari/.test(ua)?'Safari':'Lainnya',
      os:/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iOS':/Windows/.test(ua)?'Windows':/Mac/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'Lainnya'};
  }
  function referrer(value) {try {const host=new URL(value).hostname.toLowerCase();return host===location.hostname?'internal':host.slice(0,120);}catch{return 'langsung';}}
  async function rpc(name,params={}) {
    const r=await fetch(config.url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify(params),signal:AbortSignal.timeout(10000)});
    if(!r.ok)throw new Error('Statistik belum tersedia');
    return r.status===204?null:r.json();
  }
  async function totals(){
    try{const t=await rpc('visitor_totals');document.getElementById('visitorTotal').textContent=Number(t.total).toLocaleString('id-ID');document.getElementById('visitorToday').textContent=Number(t.today).toLocaleString('id-ID');document.getElementById('visitorStatus').textContent='';}
    catch{document.getElementById('visitorStatus').textContent='Statistik sementara tidak tersedia';}
  }
  if(!config?.key){document.getElementById('visitorStatus').textContent='Statistik belum diaktifkan';return;}
  totals();
  // Respect opt-out signals. Counts can still be viewed without being recorded.
  if(navigator.doNotTrack==='1'||navigator.globalPrivacyControl||location.hostname!=='ekokominfo.github.io')return;
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
    try{await rpc('record_visit',{p_visitor:visitor,p_session:session,p_device:meta.device,p_browser:meta.browser,p_os:meta.os,p_referrer:referrer(document.referrer),p_feature:feature});if(feature==='pageview')totals();}
    catch{seen.delete(session+feature);}
  }
  record('pageview');
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)record(entry.target.id);},{threshold:0,rootMargin:'-20% 0px -20% 0px'});
  features.forEach(id=>{const element=document.getElementById(id);if(element)observer.observe(element);});
})();
