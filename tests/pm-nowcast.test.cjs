const {test}=require('node:test'),assert=require('node:assert/strict'),{calculate}=require('../pm-nowcast.js');
const hourly=values=>({time:values.map((_,i)=>`2026-10-25T${String(i).padStart(2,'0')}:00`),pm2_5:values});
test('stable concentrations follow EPA PM2.5 category breakpoints',()=>{
 for(const [value,band]of [[0,0],[9,0],[9.1,1],[35.4,1],[35.5,2],[55.4,2],[55.5,3],[125.4,3],[125.5,4],[225.4,4],[225.5,5],[1400,5]])assert.equal(calculate(hourly([value,value]),1).band,band,String(value));
});
test('variable concentrations weight recent hours, not a simple mean',()=>{
 const h=hourly([10,20,100]),before=JSON.stringify(h),r=calculate(h,2);
 assert.equal(r.concentration,64.2);assert.equal(r.band,3);assert.equal(JSON.stringify(h),before);
});
test('missing hours retain their actual ages and need two of last three',()=>{
 const h={time:['2026-10-25T00:00','2026-10-25T02:00'],pm2_5:[10,100]};
 assert.equal(calculate(h,1).concentration,82);
 assert.equal(calculate({time:['2026-10-25T00:00','2026-10-25T03:00'],pm2_5:[10,100]},1),null);
 for(const values of [[null,20,null],[NaN,20,undefined],[-1,20,null]])assert.equal(calculate(hourly(values),2),null);
});
test('uses only past twelve clock hours and ignores future rows',()=>{
 const h=hourly([900,...Array(12).fill(5),1000]);assert.equal(calculate(h,12).concentration,5);assert.equal(calculate(h,12).hours,12);
 const mixed={time:['2026-10-25T01:00:00Z','2026-10-25T09:00'],pm2_5:[5,5]};assert.equal(calculate(mixed,1).band,0);
 assert.equal(calculate(null,0),null);assert.equal(calculate(hourly([5]),0),null);assert.equal(calculate({time:['bad'],pm2_5:[5]},0),null);
});
