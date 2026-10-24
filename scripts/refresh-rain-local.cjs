'use strict';
const fs=require('node:fs/promises'),path=require('node:path');
const {forecastURL,validate}=require('./rain-core.cjs');
const {villagePoints}=require('./cache-core.cjs');
async function collect(){
 const root=path.resolve(__dirname,'..'),points=villagePoints(JSON.parse(await fs.readFile(path.join(root,'villages.geojson'),'utf8')));
 const all=[{key:'main',name:'Titik acuan Kahayan Hilir',lat:-2.75,lon:114.25},...points],saved=new Map();
 try{const old=JSON.parse(await fs.readFile(path.join(root,'rain-local.json'),'utf8'));for(const p of old.points||[])saved.set(p.key,p);if(old.hourly)saved.set('main',old);}catch{}
 let failures=0,updated=0;
 for(let start=0;start<all.length;start+=20){
  const batch=all.slice(start,start+20);
  try{const response=await fetch(forecastURL(batch),{signal:AbortSignal.timeout(40000)});if(!response.ok){if(response.status===429){console.error('Kuota cuaca tercapai; sisa batch dihentikan.');failures+=all.length-start;break;}throw Error('HTTP '+response.status);}let models=await response.json();if(!Array.isArray(models))models=[models];
   batch.forEach((p,i)=>{try{saved.set(p.key,{...p,...validate(models[i])});updated++;}catch{failures++;}});
  }catch(e){console.error('Batch cuaca gagal: '+e.message);failures+=batch.length;}
 }
 if(!updated)throw Error('Belum ada data baru yang valid');
 const main=saved.get('main'),data={...main,points:points.map(p=>saved.get(p.key)).filter(Boolean)};
 for(const dir of ['','dist']){const file=path.join(root,dir,'rain-local.json');await fs.writeFile(file+'.tmp',JSON.stringify(data));await fs.rename(file+'.tmp',file);}
 console.log('Prakiraan lokal: '+updated+' lokasi diperbarui, '+data.points.length+' desa tersimpan, '+failures+' gagal.');
}
if(require.main===module)collect().catch(e=>{console.error(e.message+'; data valid sebelumnya dipertahankan.');process.exitCode=1;});
module.exports={collect};
