/* NASA FIRMS regional CSVs; administrative labels are spatial joins, not FIRMS fields. */
(function(scope){
 'use strict';
 const SOURCES=[['modis-c6.1','MODIS_C6_1','NASA-MODIS'],['suomi-npp-viirs-c2','SUOMI_VIIRS_C2','NASA-SNPP'],['noaa-20-viirs-c2','J1_VIIRS_C2','NASA-NOAA20']].map(([folder,prefix,satellite])=>({satellite,url:'https://firms2.modaps.eosdis.nasa.gov/data/active_fire/'+folder+'/csv/'+prefix+'_SouthEast_Asia_48h.csv'}));
 const invalid=()=>Object.assign(new Error('Invalid or stale NASA FIRMS response'),{kind:'invalid'});
 // WIB is UTC+07:00; format once per detection without constructing Intl formatters.
 const stamp=d=>new Date(+d+25200000).toISOString().slice(0,19).replace('T',' ');
 function ringContains(r,x,y){let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
 function contains(g,x,y){const polys=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];return polys.some(p=>ringContains(p[0],x,y)&&!p.slice(1).some(h=>ringContains(h,x,y)));}
 function index(features){return features.map(f=>{let a=Infinity,b=Infinity,c=-Infinity,d=-Infinity;const visit=v=>{if(typeof v[0]==='number'){a=Math.min(a,v[0]);b=Math.min(b,v[1]);c=Math.max(c,v[0]);d=Math.max(d,v[1]);}else v.forEach(visit);};visit(f.geometry.coordinates);return {f,b:[a,b,c,d]};});}
 const find=(features,x,y)=>features.find(({f,b})=>x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3]&&contains(f.geometry,x,y))?.f;
 function csvRows(text){const lines=text.trim().replace(/^\uFEFF/,'').split(/\r?\n/),header=lines.shift()?.split(',');for(const k of ['latitude','longitude','acq_date','acq_time','satellite','confidence'])if(!header?.includes(k))throw invalid();return lines.filter(Boolean).map(line=>{const values=line.split(',');if(values.length!==header.length)throw invalid();return Object.fromEntries(header.map((k,i)=>[k,values[i]]));});}
 function normalize(files,geo,now=new Date()){
  if(files.length!==3||geo.regencies?.length!==14||!geo.districts?.length||!geo.villages?.length)throw invalid();
  const regions=index(geo.regencies),villages=index(geo.villages),districts=index(geo.districts),seen=new Set();
  const feeds=Object.fromEntries(['High','Medium','Low'].map(l=>[l,{statusCode:200,source:'NASA FIRMS',generated_at:now.toISOString(),retrieved_at:now.toISOString(),timestamp_kind:'retrieved',latest_detection:null,coverage_hours:48,data:{type:'FeatureCollection',features:[]}}]));
  for(let i=0;i<3;i++){
   const file=files[i],modified=Date.parse(file.modifiedAt);if(!Number.isFinite(modified)||+now-modified>6*3600000||modified>+now+300000)throw invalid();
   for(const p of csvRows(file.csv)){
    const x=Number(p.longitude),y=Number(p.latitude),clock=p.acq_time.padStart(4,'0');
    if(!p.longitude||!p.latitude||!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>180||Math.abs(y)>90||!/^\d{4}-\d{2}-\d{2}$/.test(p.acq_date)||!/^([01]\d|2[0-3])[0-5]\d$/.test(clock))throw invalid();
    const t=Date.parse(p.acq_date+'T'+clock.slice(0,2)+':'+clock.slice(2)+':00Z');if(!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==p.acq_date||t>+now+300000)throw invalid();
    const conf=p.confidence.toLowerCase();let level;if(i===0){const n=Number(conf);if(!conf||!Number.isFinite(n)||n<0||n>100)throw invalid();level=n<30?'Low':n<80?'Medium':'High';if(!['T','A'].includes(p.satellite))throw invalid();}else{level={low:'Low',l:'Low',nominal:'Medium',n:'Medium',high:'High',h:'High'}[conf];if(!level||(i===1&&!['N','SNPP'].includes(p.satellite))||(i===2&&!['N20','NOAA-20'].includes(p.satellite)))throw invalid();}
    if(t<+now-48*3600000)continue;
    const village=find(villages,x,y),region=village?{properties:{name:'Pulang Pisau'}}:find(regions,x,y);if(!region)continue;
    const district=village?null:region.properties.name==='Pulang Pisau'?find(districts,x,y):null;
    const key=[i,p.satellite,x,y,t].join('|');if(seen.has(key))continue;seen.add(key);
    const feed=feeds[level];feed.data.features.push({type:'Feature',geometry:{type:'Point',coordinates:[x,y]},properties:{kabupaten:region.properties.name,desa:village?.properties.NAMA_KEL||'Tidak diketahui',kecamatan:village?.properties.NAMA_KEC||district?.properties.NAMA_KEC||'Tidak diketahui',satelit:SOURCES[i].satellite,date_hotspot:stamp(new Date(t)),confidence:level,confidence_raw:p.confidence,source:'NASA FIRMS',location_method:'spatial boundary join'}});
    const iso=new Date(t).toISOString();if(!feed.latest_detection||iso>feed.latest_detection)feed.latest_detection=iso;
   }
  }
  return feeds;
 }
 async function load(fetcher,geo,now=new Date()){
  const files=await Promise.all(SOURCES.map(async s=>{const r=await fetcher(s.url,{signal:AbortSignal.timeout(30000),cache:'no-store'});if(!r.ok)throw Object.assign(new Error('FIRMS HTTP '+r.status),{kind:r.status===429?'quota':'upstream',status:r.status});return {csv:await r.text(),modifiedAt:r.headers.get('last-modified')};}));
  return normalize(files,geo,now);
 }
 function recentArchive(feeds,now=new Date()){
  const days=[stamp(new Date(+now-86400000)).slice(0,10),stamp(now).slice(0,10)],names=['Barito Selatan','Barito Timur','Barito Utara','Gunung Mas','Kapuas','Katingan','Kotawaringin Barat','Kotawaringin Timur','Lamandau','Murung Raya','Pulang Pisau','Seruyan','Sukamara','Kota Palangka Raya'];
  const rows=Object.fromEntries(days.map(d=>[d,{kab:Object.fromEntries(names.map(n=>[n,0])),partial:d===days[1],source:'NASA FIRMS'}]));
  for(const feed of Object.values(feeds))for(const f of feed.data.features){const p=f.properties,row=rows[p.date_hotspot.slice(0,10)];if(row){if(!Object.hasOwn(row.kab,p.kabupaten))throw invalid();row.kab[p.kabupaten]++;}}return rows;
 }
 const api={SOURCES,normalize,load,recentArchive,contains};scope.FirmsSource=api;
})(typeof window!=='undefined'?window:globalThis);

export default globalThis.FirmsSource;
