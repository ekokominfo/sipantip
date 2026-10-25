(function(scope){
 'use strict';
 function valid(p){return p&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180;}
 function distance(a,b){if(!valid(a)||!valid(b))return Infinity;const rad=Math.PI/180,dlat=(b.lat-a.lat)*rad,dlon=(b.lon-a.lon)*rad,h=Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlon/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,h)));}
 function nearest(origin,records,limit=3){return records.filter(valid).map(r=>({...r,distance:distance(origin,r)})).sort((a,b)=>a.distance-b.distance).slice(0,limit);}
 function highHotspots(records,period,now=Date.now()){
  const seen=new Set();return records.filter(r=>{const stamp=String(r.when).trim().replace(' WIB','').replace(' ','T'),t=Date.parse(stamp+(/[zZ]$|[+-]\d{2}:\d{2}$/.test(stamp)?'':'+07:00'));if(r.level!=='High'||!valid(r)||!Number.isFinite(t)||t>now)return false;if(period==='24h'||period==='48h'){if(t<now-parseInt(period)*3600000)return false;}else if(period&&!r.when.startsWith(period))return false;const key=r.lat.toFixed(4)+','+r.lon.toFixed(4);if(seen.has(key))return false;seen.add(key);return true;});
 }
 function facilitiesOnly(records){return records.filter(r=>valid(r)&&r.regency==='Pulang Pisau'&&['puskesmas','rumah_sakit'].includes(r.type));}
 function routeURL(origin,destination){if(!valid(origin)||!valid(destination))return null;const facility=['puskesmas','rumah_sakit'].includes(destination.type)&&destination.regency==='Pulang Pisau',target=facility?destination.name+', Kabupaten Pulang Pisau, Kalimantan Tengah':destination.lat+','+destination.lon;const q=new URLSearchParams({api:'1',origin:origin.lat+','+origin.lon,destination:target,travelmode:'driving'});return 'https://www.google.com/maps/dir/?'+q;}
 const api={valid,distance,nearest,highHotspots,facilitiesOnly,routeURL};scope.Nearby=api;if(typeof module!=='undefined')module.exports=api;
 if(typeof document==='undefined')return;
 const byId=id=>document.getElementById(id),ui={position:null,mode:'hotspot',facilities:null,pending:null,group:null,busy:false,request:0};
 function message(text){byId('nearbyStatus').textContent=text;}
 function clear(){ui.request++;ui.position=null;ui.busy=false;ui.group?.clearLayers();byId('locateMe').disabled=false;byId('locateMe').removeAttribute('aria-busy');byId('nearbyPanel').hidden=true;byId('locateMe').setAttribute('aria-pressed','false');message('Lokasi dihapus. Klik Lokasi saya untuk mencari kembali.');}
 async function loadFacilities(){if(ui.facilities)return ui.facilities;if(!ui.pending)ui.pending=fetch('health-facilities.json',{signal:AbortSignal.timeout(15000)}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(j=>{ui.facilities=facilitiesOnly(j.facilities||[]);return ui.facilities;}).finally(()=>{ui.pending=null;});return ui.pending;}
 function drawOrigin(){if(!ui.position||!state.map)return;ui.group=L.layerGroup().addTo(state.map);L.circle([ui.position.lat,ui.position.lon],{radius:Math.min(ui.position.accuracy||0,20000),weight:1,color:'#2563b6',fillOpacity:.06,interactive:false}).addTo(ui.group);L.circleMarker([ui.position.lat,ui.position.lon],{radius:8,weight:3,color:'#fff',fillColor:'#2563b6',fillOpacity:1}).bindTooltip('Lokasi saya').addTo(ui.group);}
 async function render(){
  if(!ui.position)return;const request=++ui.request,origin=ui.position,facility=ui.mode==='facility',host=byId('nearbyResults');
  byId('nearbyPanel').hidden=false;byId('nearbyTitle').textContent=facility?'Puskesmas / RS Pulang Pisau terdekat':'Titik panas Tinggi terdekat';
  document.querySelectorAll('[data-nearby-mode]').forEach(b=>{const active=b.dataset.nearbyMode===ui.mode;b.setAttribute('aria-pressed',String(active));});host.textContent='Mencari lokasi terdekat…';
  let records;
  try{records=facility?await loadFacilities():highHotspots(state.raw,byId('date').value);}
  catch{if(request!==ui.request||!ui.position)return;host.innerHTML='<p>Daftar fasilitas belum dapat dimuat.</p><button type="button" id="retryFacilities">Coba lagi</button>';byId('retryFacilities').onclick=render;return;}
  if(request!==ui.request||origin!==ui.position)return;
  if(ui.group){state.map?.removeLayer(ui.group);ui.group=null;}drawOrigin();
  const results=nearest(origin,records);host.replaceChildren();
  byId('nearbyNote').textContent=(facility?'Puskesmas dan RS di Kabupaten Pulang Pisau. ':'Semua kecamatan Pulang Pisau · '+periodLabel()+'. Hanya tingkat kepercayaan Tinggi. ')+ 'Jarak garis lurus; jarak dan akses jalan mengikuti penyedia rute.';
  if(!facility&&!state.loaded){host.textContent='Data titik panas belum tersedia. Coba Refresh data.';return;}
  if(!results.length){host.textContent=facility?'Belum ada fasilitas dengan titik lokasi terverifikasi.':'Tidak ada deteksi tingkat Tinggi pada periode ini. Tingkat Sedang dan Rendah tidak ditampilkan.';return;}
  for(const [i,r] of results.entries()){
   const title=facility?r.name:(r.desa||'Lokasi deteksi')+' · '+r.kec,detail=facility?(r.type==='rumah_sakit'?'Rumah sakit':'Puskesmas'):'Deteksi '+r.when;
   const row=document.createElement('article');row.className='nearby-result';row.innerHTML='<div><strong>'+esc(title)+'</strong><span>'+esc(detail)+'</span><b>'+new Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(r.distance)+' km</b></div><div class="nearby-result-actions"><button type="button">Lihat peta</button><a target="_blank" rel="noopener noreferrer" href="'+esc(routeURL(origin,r))+'">Buka rute ↗</a></div>';
   const marker=state.map?L.circleMarker([r.lat,r.lon],{radius:8,weight:2,color:'#fff',fillColor:facility?'#187b71':'#c95635',fillOpacity:1}).bindPopup('<b>'+esc(title)+'</b><br>'+esc(detail)+'<br>Jarak garis lurus '+r.distance.toFixed(1)+' km').addTo(ui.group):null;
   row.querySelector('button').onclick=()=>{if(!state.map)return;state.map.stop();state.map.fitBounds([[origin.lat,origin.lon],[r.lat,r.lon]],{padding:[50,50],maxZoom:14,animate:false});marker.openPopup();byId('map').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});};host.append(row);
  }
  if(facility){const small=document.createElement('small');small.className='facility-coverage';small.textContent='Titik acuan dari peta situs resmi Dinkes/RSUD. 12 puskesmas dan 1 RSUD. Titik acuan dapat berbeda dari pintu masuk fasilitas.';host.append(small);}
 }
 byId('locateMe').onclick=()=>{
  if(ui.busy)return;if(!navigator.geolocation){message('Browser ini belum mendukung lokasi. Gunakan browser dengan layanan lokasi aktif.');return;}
  if(!window.isSecureContext){message('Lokasi memerlukan akses HTTPS.');return;}
  ui.busy=true;const request=++ui.request;const button=byId('locateMe');button.disabled=true;button.setAttribute('aria-busy','true');message('Menunggu izin dan posisi dari perangkat…');
  navigator.geolocation.getCurrentPosition(position=>{
   if(request!==ui.request)return;ui.busy=false;button.disabled=false;button.removeAttribute('aria-busy');const point={lat:position.coords.latitude,lon:position.coords.longitude,accuracy:position.coords.accuracy};
   if(!valid(point)){message('Koordinat perangkat belum valid. Coba lagi.');return;}ui.position=point;button.setAttribute('aria-pressed','true');message('Lokasi ditemukan · akurasi sekitar '+Math.round(point.accuracy||0)+' meter. Lokasi hanya dipakai di perangkat ini sampai Anda membuka rute.');
   if(state.map){state.map.stop();state.map.setView([point.lat,point.lon],12,{animate:false});}render();
  },error=>{if(request!==ui.request)return;ui.busy=false;button.disabled=false;button.removeAttribute('aria-busy');message(error.code===1?'Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini, lalu coba lagi.':error.code===3?'Pencarian lokasi melewati batas waktu. Coba lagi di area dengan sinyal lebih baik.':'Posisi belum ditemukan. Aktifkan GPS atau layanan lokasi, lalu coba lagi.');},{enableHighAccuracy:true,timeout:15000,maximumAge:60000});
 };
 byId('clearMyLocation').onclick=clear;document.querySelectorAll('[data-nearby-mode]').forEach(b=>b.onclick=()=>{ui.mode=b.dataset.nearbyMode;render();});
 document.addEventListener('sipantip:hotspots',()=>{if(ui.position)render();});
})(typeof window!=='undefined'?window:globalThis);
