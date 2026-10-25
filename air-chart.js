'use strict';
function airChartRows(times,pm,aqi){return times.map((time,i)=>({time,pm:Number.isFinite(pm[i])&&pm[i]>=0?pm[i]:null,aqi:Number.isFinite(aqi[i])&&aqi[i]>=0?aqi[i]:null}));}
function airChartPath(rows,field,x,y){let connected=false;return rows.map((r,i)=>{if(r[field]===null){connected=false;return '';}const point=(connected?'L':'M')+x(i)+','+y(r[field]);connected=true;return point;}).join(' ');}
function airChartSVG(rows,width=600){
 const fmt=n=>n.toLocaleString('id-ID',{maximumFractionDigits:1}),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const left=45,right=width-45,top=35,bottom=210,height=250;
 const maxFor=field=>Math.ceil(Math.max(10,...rows.map(r=>r[field]??0))*1.1/10)*10;
 const maxPM=maxFor('pm'),maxAQI=maxFor('aqi'),x=i=>left+i/Math.max(1,rows.length-1)*(right-left),y=(v,max)=>bottom-v/max*(bottom-top);
 const blue='#2563b6',purple='#c45a08',num=v=>v===null?'Tidak tersedia':fmt(v);
 const title=r=>r.time.replace('T',' ')+' WIB · PM 2.5 '+num(r.pm)+(r.pm===null?'':' µg/m³')+' · Kualitas udara '+num(r.aqi)+(r.aqi===null?'':' US AQI');
 const ticks=[0,.5,1].map(f=>{const yy=bottom-f*(bottom-top);return `<line x1="${left}" y1="${yy}" x2="${right}" y2="${yy}" stroke="#e6ebe2"/><text x="${left-8}" y="${yy+4}" text-anchor="end" fill="${blue}" font-size="11">${fmt(f*maxPM)}</text><text x="${right+8}" y="${yy+4}" fill="${purple}" font-size="11">${fmt(f*maxAQI)}</text>`;}).join('');
 const lines=[['pm',maxPM,blue,''],['aqi',maxAQI,purple,'stroke-dasharray="6 4"']].map(([field,max,color,dash])=>`<path d="${airChartPath(rows,field,x,v=>y(v,max))}" fill="none" stroke="${color}" stroke-width="2.5" ${dash}/>`+rows.map((r,i)=>r[field]===null?'':`<circle cx="${x(i)}" cy="${y(r[field],max)}" r="2.5" fill="${color}"/>`).join('')).join('');
 const hits=rows.map((r,i)=>{const a=i?((x(i-1)+x(i))/2):left,b=i<rows.length-1?((x(i)+x(i+1))/2):right;return `<rect x="${a}" y="${top}" width="${Math.max(1,b-a)}" height="${bottom-top}" fill="transparent" tabindex="0" role="button" data-tooltip="${esc(title(r))}" aria-label="${esc(title(r))}"></rect>`;}).join('');
 const labels=[...new Set([0,Math.floor(rows.length/2),rows.length-1])].map(i=>`<text x="${x(i)}" y="239" text-anchor="${i===0?'start':i===rows.length-1?'end':'middle'}" fill="#78867e" font-size="11">${esc(rows[i].time.slice(11,16))} WIB</text>`).join('');
 return `<svg viewBox="0 0 ${width} ${height}" role="group" aria-label="PM 2.5 dan kualitas udara 24 jam. Sumbu kiri PM 2.5, sumbu kanan US AQI. Sorot atau sentuh grafik untuk kedua nilai."><text x="${left}" y="16" fill="${blue}" font-size="11">µg/m³</text><text x="${right}" y="16" text-anchor="end" fill="${purple}" font-size="11">US AQI</text>${ticks}${lines}${hits}${labels}</svg>`;
}

let lastAirChart=null;
function plot(times,values,aqiValues=[]){
 lastAirChart={times,values,aqiValues};const rows=airChartRows(times,values,aqiValues).slice(-24),host=document.getElementById('chart');
 if(!rows.length||!rows.some(r=>r.pm!==null||r.aqi!==null)){host.textContent='Data PM 2.5 dan kualitas udara belum tersedia.';return;}
 host.innerHTML=airChartSVG(rows,Math.max(320,Math.round(host.clientWidth||600)));
}
if(typeof window!=='undefined'){let airResize;window.addEventListener('resize',()=>{cancelAnimationFrame(airResize);airResize=requestAnimationFrame(()=>{if(lastAirChart)plot(lastAirChart.times,lastAirChart.values,lastAirChart.aqiValues);});});}
