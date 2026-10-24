// Edge transport: no local process spawning or filesystem required.
export async function sourceRequest(fetcher,url){
 for(let attempt=0;attempt<2;attempt++){
  try{const response=await fetcher(url,{signal:AbortSignal.timeout(15000)});if(response.status<500||attempt===1)return response;await response.body?.cancel();}
  catch(e){if(attempt===1)throw Object.assign(new Error('network'),{kind:'network',detail:String(e.cause?.code||e.name||'fetch failed')});}
  await new Promise(r=>setTimeout(r,500));
 }
}
