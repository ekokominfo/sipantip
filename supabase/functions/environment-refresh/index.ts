import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import {refreshData} from './collector.mjs';
import FirmsSource from './firms-source.mjs';
import {FIRMS_GEO} from './firms-geography.mjs';

// verify_jwt is disabled for pg_net; a server-only Vault secret is checked
// through a service-role-only database RPC before any source request is made.
Deno.serve(async request=>{
 if(request.method!=='POST')return Response.json({error:'Method not allowed'},{status:405});
 const secret=request.headers.get('x-sipantip-collector');
 if(!secret||!(/^[a-f0-9]{64}$/.test(secret)))return Response.json({error:'Unauthorized'},{status:401});
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!key)return Response.json({error:'Backend configuration unavailable'},{status:503});
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:claimed,error}=await client.rpc('claim_environment_refresh',{p_secret:secret});
 if(error||!claimed)return Response.json({error:'Unauthorized or collection already running'},{status:403});
 let result;let status=200;
 try{
  const body=await request.json().catch(()=>({}));
  if(body.action==='probe'||body.action==='probe-official'){
   const feeds=await FirmsSource.load(fetch,FIRMS_GEO);result={ok:true,probe:true,source:'NASA FIRMS',features:Object.values(feeds).reduce((n,f)=>n+f.data.features.length,0),latestDetection:Object.values(feeds).map(f=>f.latest_detection).filter(Boolean).sort().at(-1)||null};
  }else{
   const manifest=await refreshData({output:client.storage.from('sipantip-environment'),force:body.force===true});
   const errors=Object.entries(manifest.resources).filter(([,e])=>e.error).map(([key,e])=>({key,kind:e.error.kind}));
   result={ok:errors.length===0,updatedAt:manifest.updatedAt,errors};if(errors.length)status=502;
  }
 }catch(e){status=502;result={ok:false,error:e instanceof Error?e.message:'Collection failed'};}
 await client.rpc('finish_environment_refresh',{p_secret:secret,p_status:result});
 return Response.json(result,{status});
});
