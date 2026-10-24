/* Public SiPongi map endpoint, verified from its official website's map client. */
(function(scope){
 'use strict';
 const BASE='https://opsroom.sipongidata.my.id/api/opsroom/indoHotspot';
 const LEVELS={low:'Low',medium:'Medium',high:'High'},SATELLITES=['NASA-MODIS','NASA-SNPP','NASA-NOAA20'];
 const REGENCIES=['Barito Selatan','Barito Timur','Barito Utara','Gunung Mas','Kapuas','Katingan','Kotawaringin Barat','Kotawaringin Timur','Lamandau','Murung Raya','Pulang Pisau','Seruyan','Sukamara','Kota Palangka Raya'];
 const invalid=()=>Object.assign(new Error('Invalid SiPongi response'),{kind:'invalid'});
 const stamp=date=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(date);
 function url(){const u=new globalThis.URL(BASE);for(const [k,v]of Object.entries({wilayah:'IN',filterperiode:'false',from:'',to:'',late:'48',provinsi:'13',kabkota:''}))u.searchParams.set(k,v);for(const s of SATELLITES)u.searchParams.append('satelit[]',s);for(const level of Object.keys(LEVELS))u.searchParams.append('confidence[]',level);return u.href;}
 function normalize(j,now=new Date()){
  if(j?.type!=='FeatureCollection'||!Array.isArray(j.features))throw invalid();
  const feeds=Object.fromEntries(Object.values(LEVELS).map(level=>[level,{statusCode:200,generated_at:now.toISOString(),retrieved_at:now.toISOString(),timestamp_kind:'retrieved',source:'SIPONGI KEMENHUT',latest_detection:null,coverage_hours:48,data:{type:'FeatureCollection',features:[]}}]));
  for(const f of j.features){const p=f.properties,c=f.geometry?.coordinates,t=Date.parse(p?.date_hotspot_ori),level=LEVELS[p?.confidence_level];
   if(!p||p.provinsi_id!==13||!level||!SATELLITES.includes(p.sumber)||!Number.isFinite(t)||t>+now+300000||!Array.isArray(c)||!Number.isFinite(c[0])||!Number.isFinite(c[1])||Math.abs(c[0])>180||Math.abs(c[1])>90||typeof p.kabkota!=='string'||!p.kabkota.trim())throw invalid();
   const date=new Date(t),data=feeds[level];data.data.features.push({type:'Feature',geometry:{type:'Point',coordinates:c.slice(0,2)},properties:{kabupaten:p.kabkota,desa:p.desa||null,kecamatan:p.kecamatan||null,satelit:p.sumber,date_hotspot:stamp(date),confidence:level}});
   const iso=date.toISOString();if(!data.latest_detection||iso>data.latest_detection)data.latest_detection=iso;
  }
  return feeds;
 }
 function recentArchive(feeds,now=new Date()){
  // The rolling 48-hour query fully covers yesterday and today's elapsed hours.
  // Older dates are never inferred as zero or recomputed from partial-day coverage.
  const days=[stamp(new Date(+now-86400000)).slice(0,10),stamp(now).slice(0,10)],rows=Object.fromEntries(days.map(d=>[d,{kab:Object.fromEntries(REGENCIES.map(k=>[k,0])),partial:d===days[1],source:'SIPONGI KEMENHUT'}]));
  const name=s=>s.toLowerCase().replace(/^kota /,'').replace(/\s+/g,'');
  for(const feed of Object.values(feeds))for(const f of feed.data.features){const p=f.properties,day=p.date_hotspot.slice(0,10);if(!rows[day])continue;const key=REGENCIES.find(k=>name(k)===name(p.kabupaten));if(!key)throw invalid();rows[day].kab[key]++;}
  return rows;
 }
 const api={url,normalize,recentArchive};scope.SiPongiSource=api;
})(typeof window!=='undefined'?window:globalThis);

export default globalThis.SiPongiSource;
