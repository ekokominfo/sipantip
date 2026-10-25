(() => {
 const $=id=>document.getElementById(id), config=window.SIPANTIP_ANALYTICS;
 let token=null, expires=0, requestSequence=0;
 const date=value=>value?new Date(value).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',dateStyle:'medium',timeStyle:'short'})+' WIB':'Belum ada';
 async function request(path,body,auth){const response=await fetch(config.url+path,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+auth}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});if(!response.ok){const e=new Error('Permintaan gagal');e.status=response.status;try{const detail=await response.json();e.code=detail.error_code||detail.code||'';}catch{}throw e;}return response.status===204?null:response.json();}
 function signout(){requestSequence++;document.getElementById('adminChartTip')?.remove();token=null;expires=0;$('adminReport').hidden=true;$('loginPanel').hidden=false;$('reportBody').replaceChildren();$('adminPassword').value='';}
 function render(data){renderAdminReport(data,Number($('reportDays').value));}
 async function load(){
  const sequence=++requestSequence;
  $('reportStatus').textContent='Mengambil statistik…';$('reloadReport').disabled=true;
  try{if(Date.now()>=expires){signout();$('loginStatus').textContent='Sesi berakhir. Silakan masuk kembali.';return;}const data=await request('/rest/v1/rpc/visitor_report',{p_days:Number($('reportDays').value)},token);if(sequence!==requestSequence)return;render(data);$('reportStatus').textContent='Diperbarui '+date(new Date());}
  catch(e){if(sequence!==requestSequence)return;$('reportBody').replaceChildren();if(e.status===401||e.status===403){signout();$('loginStatus').textContent='Akun belum memiliki akses admin atau sesi sudah berakhir.';}else $('reportStatus').textContent='Statistik gagal dimuat. Tekan Perbarui untuk mencoba lagi.';}
  finally{if(sequence===requestSequence||!token)$('reloadReport').disabled=false;}
 }
 $('adminLogin').addEventListener('submit',async e=>{e.preventDefault();$('loginButton').disabled=true;$('loginStatus').textContent='Memeriksa akun…';try{const data=await request('/auth/v1/token?grant_type=password',{email:$('adminEmail').value.trim(),password:$('adminPassword').value});token=data.access_token;expires=Date.now()+data.expires_in*1000;$('adminPassword').value='';$('loginPanel').hidden=true;$('adminReport').hidden=false;await load();}catch(error){const messages={invalid_credentials:'Email atau password tidak cocok. Gunakan password akun pengguna yang dibuat melalui Create user di Supabase, bukan password database.',email_not_confirmed:'Email akun belum dikonfirmasi. Periksa pengaturan pengguna di Supabase.',over_request_rate_limit:'Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.'};$('loginStatus').textContent=messages[error.code]||(error.status===429?'Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.':error.status?'Login ditolak layanan autentikasi (HTTP '+error.status+'). Silakan coba lagi.':'Tidak dapat menghubungi layanan login. Periksa koneksi lalu coba lagi.');}finally{$('loginButton').disabled=false;}});
 $('logoutButton').onclick=async()=>{const current=token;signout();$('loginStatus').textContent='Sudah keluar.';try{await request('/auth/v1/logout',{},current);}catch{}};
 $('reloadReport').onclick=load;$('reportDays').onchange=load;
})();
