'use strict';
const {setDefaultResultOrder}=require('node:dns');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const run=promisify(execFile);
setDefaultResultOrder('ipv4first');
async function curlRequest(url){
 const target=new URL(url);
 if(target.origin!=='https://appscript.palangkaraya.go.id'||!target.pathname.startsWith('/hotspot/api/'))throw new Error('Unsupported fallback URL');
 // curl uses a different connection stack; TLS verification stays enabled.
 const {stdout}=await run('curl',['--ipv4','--silent','--show-error','--connect-timeout','25','--max-time','60','--max-filesize','33554432','--write-out','\n%{http_code}',url],{timeout:65000,maxBuffer:34*1024*1024});
 const split=stdout.lastIndexOf('\n'),status=Number(stdout.slice(split+1));
 return new Response(stdout.slice(0,split),{status});
}
async function sourceRequest(fetcher,url,{sleep=ms=>new Promise(r=>setTimeout(r,ms)),fallback=fetcher===globalThis.fetch?curlRequest:null}={}){
 for(let attempt=0;attempt<3;attempt++){
  try{
   const response=await fetcher(url,{signal:AbortSignal.timeout(40000),headers:{'User-Agent':'SIPANTIP-data-cache/3.0'}});
   if(response.status<500||attempt===2)return response;
   await response.body?.cancel();
  }catch(e){const code=e.cause?.code||e.code||e.name;if(attempt===0&&fallback&&new URL(url).hostname==='appscript.palangkaraya.go.id'&&['UND_ERR_CONNECT_TIMEOUT','ETIMEDOUT','ECONNRESET','EAI_AGAIN','ENOTFOUND'].includes(code)){try{return await fallback(url);}catch{ /* retain the original diagnostics and normal retries */ }}if(attempt===2){const err=new Error('network');err.kind='network';err.detail=String(code||'fetch failed');throw err;}}
  await sleep(1000*2**attempt);
 }
}
module.exports={sourceRequest,curlRequest};
