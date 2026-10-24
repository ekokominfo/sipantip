const SEED='https://raw.githubusercontent.com/ekokominfo/sipantip/data-cache/cache/';
const objectPath=p=>/^objects\/[a-f0-9]{64}\.json$/.test(p||'');
export class Store{
 constructor(bucket,now=new Date()){this.bucket=bucket;this.now=now;this.iso=now.toISOString();this.manifest={version:1,updatedAt:this.iso,resources:{},providers:{}};this.values=new Map();}
 async init(){
  const {data,error}=await this.bucket.download('manifest.json');
  if(!error){const m=JSON.parse(await data.text());if(m.version!==1||!m.resources||!m.providers)throw Error('Invalid stored manifest');this.manifest=m;return this;}
  // Seed once from the known public cache before switching the public dashboard.
  // Authentication/storage outages must never reset a valid manifest.
  if(![400,404,'400','404'].includes(error.statusCode)&&error.message!=='Object not found')throw error;
  const r=await fetch(SEED+'manifest.json',{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Seed manifest unavailable');
  const m=await r.json();if(m.version!==1||!m.resources||!m.providers)throw Error('Invalid seed manifest');
  const paths=[...new Set(Object.values(m.resources).map(e=>e.path).filter(objectPath))];
  for(const p of paths){const response=await fetch(SEED+p,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Seed object unavailable');const text=await response.text();JSON.parse(text);await this.upload(p,text,false);}
  this.manifest=m;return this;
 }
 async upload(name,text,upsert){const {error}=await this.bucket.upload(name,new Blob([text],{type:'application/json'}),{contentType:'application/json',cacheControl:upsert?'0':'31536000',upsert});if(error&&!(!upsert&&(error.statusCode==='409'||error.statusCode===409)))throw error;}
 async old(key){const p=this.manifest.resources[key]?.path;if(!objectPath(p))return null;if(this.values.has(p))return this.values.get(p);const {data,error}=await this.bucket.download(p);if(error)return null;try{const j=JSON.parse(await data.text());this.values.set(p,j);return j;}catch{return null;}}
 due(key,seconds){const e=this.manifest.resources[key],last=Date.parse(e?.lastAttempt||e?.lastSuccess);return !Number.isFinite(last)||this.now-last>=seconds*1000;}
 async put(key,data,ttlSeconds,sourceTime){
  if(data===null||data===undefined)throw Object.assign(Error('invalid'),{kind:'invalid'});
  const text=JSON.stringify(data),digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)),hash=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join(''),p='objects/'+hash+'.json';
  await this.upload(p,text,false);this.values.set(p,data);this.manifest.resources[key]={path:p,lastAttempt:this.iso,lastSuccess:this.iso,sourceTime:sourceTime||null,ttlSeconds,error:null};
 }
 fail(key,e,ttlSeconds){this.manifest.resources[key]={...(this.manifest.resources[key]||{}),lastAttempt:this.iso,ttlSeconds,error:{kind:e.kind||'network',status:e.status||null,detail:e.detail||null,at:this.iso}};}
 async cleanup(){
  if(this.now-Date.parse(this.manifest.maintenance?.lastCleanup||0)<86400000)return;
  const used=new Set(Object.values(this.manifest.resources).map(e=>e.path)),seen={...(this.manifest.unreferencedSince||{})},paths=[];
  for(let offset=0;;offset+=1000){const {data,error}=await this.bucket.list('objects',{limit:1000,offset,sortBy:{column:'name',order:'asc'}});if(error)throw error;for(const entry of data){const p='objects/'+entry.name;if(objectPath(p))paths.push(p);}if(data.length<1000)break;}
  const remove=[];for(const p of paths){if(used.has(p)){delete seen[p];continue;}if(!seen[p])seen[p]=this.iso;else if(this.now-Date.parse(seen[p])>48*3600000)remove.push(p);}
  for(let i=0;i<remove.length;i+=100){const batch=remove.slice(i,i+100),{error}=await this.bucket.remove(batch);if(error)throw error;batch.forEach(p=>delete seen[p]);}
  this.manifest.unreferencedSince=seen;this.manifest.maintenance={lastCleanup:this.iso};
 }
 async save(){this.manifest.updatedAt=this.iso;try{await this.cleanup();}catch{console.warn('Environmental snapshot cleanup deferred.');}await this.upload('manifest.json',JSON.stringify(this.manifest,null,2),true);}
}
