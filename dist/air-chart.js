'use strict';
const AIR_BANDS=[
 {label:'Baik',color:'#246436',background:'#e5f2e4'},
 {label:'Sedang',color:'#746000',background:'#fff2c6'},
 {label:'Tidak sehat bagi kelompok sensitif',color:'#995109',background:'#ffe4c6'},
 {label:'Tidak sehat',color:'#9d2935',background:'#fce0e4'},
 {label:'Sangat tidak sehat',color:'#703883',background:'#efdef7'},
 {label:'Berbahaya',color:'#7b2444',background:'#f2d9e4'}
];
const PM_LIMITS=[9,35.4,55.4,125.4,225.4,Infinity],AQI_LIMITS=[50,100,150,200,300,Infinity];
function pmCategory(value){if(!Number.isFinite(value)||value<0)return null;const v=Math.floor(value*10+1e-8)/10,band=PM_LIMITS.findIndex(n=>v<=n);return {...AIR_BANDS[band],band};}
function pmRolling24(times,values){const hours=times.map(t=>Date.parse(t+'+07:00'));return times.map((_,i)=>{if(i<23)return null;let total=0;for(let j=0;j<24;j++){const k=i-j;if(!Number.isFinite(hours[k])||hours[k]!==hours[i]-j*3600000||!Number.isFinite(values[k])||values[k]<0)return null;total+=values[k];}return total/24;});}
function airChartRows(times,pm,aqi){const averages=pmRolling24(times,pm);return times.map((time,i)=>({time,pm:Number.isFinite(pm[i])&&pm[i]>=0?pm[i]:null,pm24:averages[i],aqi:Number.isFinite(aqi[i])&&aqi[i]>=0?aqi[i]:null}));}
function airChartPath(rows,field,x,y){let connected=false;return rows.map((r,i)=>{if(r[field]===null){connected=false;return '';}const point=(connected?'L':'M')+x(i)+','+y(r[field]);connected=true;return point;}).join(' ');}
function airChartSVG(rows,field,width=600){
 const pm=field==='pm24',unit=pm?'µg/m³':'US AQI',color=pm?'#1c5da6':'#7b3f91',limits=pm?PM_LIMITS:AQI_LIMITS,left=48,right=width-20,top=30,bottom=210,height=250;
 const max=Math.ceil(Math.max(pm?10:50,...rows.map(r=>r[field]??0))*1.1/10)*10,x=i=>left+i/Math.max(1,rows.length-1)*(right-left),y=v=>bottom-v/max*(bottom-top),num=v=>v===null?'Belum tersedia':v.toLocaleString('id-ID',{maximumFractionDigits:1});
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const zones=limits.map((limit,i)=>{const low=i?limits[i-1]:0,high=Math.min(max,limit);return low>=max?'':`<rect class="air-zone" x="${left}" y="${y(high)}" width="${right-left}" height="${y(low)-y(high)}" fill="${AIR_BANDS[i].background}"/>`;}).join('');
 const ticks=[0,.5,1].map(f=>`<line x1="${left}" y1="${y(f*max)}" x2="${right}" y2="${y(f*max)}" stroke="#b9c8d3" stroke-opacity=".5"/><text x="${left-7}" y="${y(f*max)+4}" text-anchor="end" fill="#52677d" font-size="11">${num(f*max)}</text>`).join('');
 const path=`<path d="${airChartPath(rows,field,x,y)}" fill="none" stroke="${color}" stroke-width="2.5"/>`,dots=rows.map((r,i)=>r[field]===null?'':`<circle cx="${x(i)}" cy="${y(r[field])}" r="2.5" fill="${color}"/>`).join('');
 const hits=rows.map((r,i)=>{const cat=pm?pmCategory(r.pm24):Number.isFinite(r.aqi)?AIR_BANDS[r.aqi<=50?0:r.aqi<=100?1:r.aqi<=150?2:r.aqi<=200?3:r.aqi<=300?4:5]:null,title=r.time.replace('T',' ')+' WIB · '+(pm?'PM2.5 rerata 24 jam: ':'Kualitas udara: ')+num(r[field])+(r[field]===null?'':' '+unit)+(cat?' · '+cat.label:'')+(pm?' · Nilai jam ini: '+num(r.pm)+(r.pm===null?'':' µg/m³'):''),a=i?(x(i-1)+x(i))/2:left,b=i<rows.length-1?(x(i)+x(i+1))/2:right;return `<rect x="${a}" y="${top}" width="${Math.max(1,b-a)}" height="${bottom-top}" fill="transparent" tabindex="0" role="button" data-tooltip="${escape(title)}" aria-label="${escape(title)}"/>`;}).join('');
 const labels=[...new Set([0,Math.floor(rows.length/2),rows.length-1])].map(i=>`<text x="${x(i)}" y="239" text-anchor="${i===0?'start':i===rows.length-1?'end':'middle'}" fill="#52677d" font-size="11">${escape(rows[i].time.slice(11,16))} WIB</text>`).join('');
 return `<svg viewBox="0 0 ${width} ${height}" role="group" aria-label="${pm?'PM2.5 rerata bergerak 24 jam':'Kualitas udara US AQI'}; zona warna kategori, sentuh titik untuk rincian"><text x="${left}" y="16" fill="${color}" font-size="11">${unit}</text>${zones}${ticks}${path}${dots}${hits}${labels}</svg>`;
}
function renderPMBadge(mean){const badge=document.getElementById('pmCategory');if(!badge)return;const category=pmCategory(mean),card=document.getElementById('pm').closest('.metric');badge.textContent=category?'Rerata 24 jam: '+category.label:'Rerata 24 jam belum tersedia';badge.style.color=category?.color||'#52677d';badge.style.background=category?.background||'#edf0f3';card.style.setProperty('--pm-color',category?.color||'#52677d');}
let lastAirChart=null;
function plot(times,values,aqiValues=[]){
 lastAirChart={times,values,aqiValues};const full=airChartRows(times,values,aqiValues),rows=full.slice(-24);renderPMBadge(full.at(-1)?.pm24??null);
 for(const [id,field] of [['chart','pm24'],['aqiChart','aqi']]){const host=document.getElementById(id);if(!host)continue;if(!rows.length||!rows.some(r=>r[field]!==null)){host.textContent=field==='pm24'?'Rerata PM2.5 belum tersedia: perlu 24 jam data lengkap.':'Data kualitas udara belum tersedia.';continue;}host.innerHTML=airChartSVG(rows,field,Math.max(320,Math.round(host.clientWidth||600)));}
 const aqiLegend=document.getElementById('aqiCategoryLegend');if(aqiLegend&&!aqiLegend.children.length)aqiLegend.innerHTML=AIR_BANDS.map((b,i)=>'<span><i style="background:'+b.background+';border-color:'+b.color+'"></i>'+b.label+' <small>'+['0–50','>50–100','>100–150','>150–200','>200–300','>300'][i]+'</small></span>').join('');
 const legend=document.getElementById('pmCategoryLegend');if(legend&&!legend.children.length)legend.innerHTML=AIR_BANDS.map((b,i)=>'<span><i style="background:'+b.background+';border-color:'+b.color+'"></i>'+b.label+' <small>'+(i===0?'0–9':i===1?'9,1–35,4':i===2?'35,5–55,4':i===3?'55,5–125,4':i===4?'125,5–225,4':'≥225,5')+'</small></span>').join('');
}
if(typeof window!=='undefined'){let airResize;window.addEventListener('resize',()=>{cancelAnimationFrame(airResize);airResize=requestAnimationFrame(()=>{if(lastAirChart)plot(lastAirChart.times,lastAirChart.values,lastAirChart.aqiValues);});});}
