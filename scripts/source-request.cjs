'use strict';
const {setDefaultResultOrder}=require('node:dns');
setDefaultResultOrder('ipv4first');
async function sourceRequest(fetcher,url,{sleep=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 for(let attempt=0;attempt<3;attempt++){
  try{
   const response=await fetcher(url,{signal:AbortSignal.timeout(40000),headers:{'User-Agent':'SIPANTIP-data-cache/3.0'}});
   if(response.status<500||attempt===2)return response;
   await response.body?.cancel();
  }catch(e){if(attempt===2){const err=new Error('network');err.kind='network';err.detail=String(e.cause?.code||e.code||e.name||'fetch failed');throw err;}}
  await sleep(1000*2**attempt);
 }
}
module.exports={sourceRequest};
