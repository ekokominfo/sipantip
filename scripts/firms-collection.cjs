'use strict';
const FirmsSource=require('../firms-source.js');
async function collectFIRMS(store,fetcher,geo,now,force){
 const keys=['High','Medium','Low'].map(l=>'hotspot-'+l),due=force||keys.some(key=>store.due(key,1800));
 if(!due)return;
 let feeds;
 try{
  feeds=await FirmsSource.load(fetcher,geo,now);
  for(const level of ['High','Medium','Low']){await store.put('hotspot-'+level,feeds[level],1800,null);store.manifest.resources['hotspot-'+level].timestampKind='retrieved';}
 }catch(e){for(const key of keys)store.fail(key,e,1800);store.fail('archive-index',e,3600);return;}
 try{
  const rows=FirmsSource.recentArchive(feeds,now),previous=await store.old('archive-index'),days=Object.keys(rows),months=[...new Set(days.map(d=>d.slice(0,7)))];
  for(const month of months){const key='archive-'+month,old=await store.old(key)||{},data={...old,...Object.fromEntries(Object.entries(rows).filter(([day])=>day.startsWith(month)))};await store.put(key,data,3600,null);}
  await store.put('archive-index',{hotspot:[...new Set([...(previous?.hotspot||[]),...days])].filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort(),diperbarui:now.toISOString(),source:'NASA FIRMS',recentCoverage:days},3600,null);
  for(const [key,entry]of Object.entries(store.manifest.resources)){if(/^archive-\d{4}-\d{2}$/.test(key)&&!months.some(m=>key==='archive-'+m)&&await store.old(key)){entry.historical=true;entry.error=null;}}
  store.manifest.providers.archive={lastAttempt:now.toISOString(),error:null,source:'NASA FIRMS; recent days accumulated, older snapshots retained'};
 }catch(e){store.fail('archive-index',e,3600);}
}
module.exports={collectFIRMS};
