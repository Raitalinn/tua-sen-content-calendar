(() => {
const schedule = window.TSCK_SCHEDULE;
const times = window.TSCK_TIMES;
const backups = window.TSCK_BACKUPS;
const startInput = document.getElementById('startDate');
const calendar = document.getElementById('calendar');
const monthTitle = document.getElementById('monthTitle');
const scheduleDate = document.getElementById('scheduleDate');
const dayNo = document.getElementById('dayNo');
const status = document.getElementById('status');
const list = document.getElementById('scheduleList');
const backupTitle = document.getElementById('backupTitle');
const backupList = document.getElementById('backupList');
const thMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
function iso(d) { const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), da=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${da}`; }
function fromISO(s) { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
function addDays(d,n) { const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function dayDiff(a,b) { const aa=Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()); const bb=Date.UTC(b.getFullYear(),b.getMonth(),b.getDate()); return Math.round((aa-bb)/86400000); }
function thaiDate(d) { const days=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์']; return `วัน${days[d.getDay()]}ที่ ${d.getDate()} ${thMonths[d.getMonth()]} ${d.getFullYear()+543}`; }
let saved=localStorage.getItem('tsck-start');
let start=saved?fromISO(saved):new Date(2026,8,7);
let selected=new Date(start);
let view=new Date(start.getFullYear(),start.getMonth(),1);
startInput.value=iso(start);
function planIndex(d){ const n=dayDiff(d,start); return n>=0&&n<30?n:-1; }
function renderCalendar(){
 monthTitle.textContent=`${thMonths[view.getMonth()]} ${view.getFullYear()+543}`; calendar.innerHTML='';
 const first=new Date(view.getFullYear(),view.getMonth(),1); const firstCell=addDays(first,-first.getDay()); const todayIso=iso(new Date());
 for(let i=0;i<42;i++){ const d=addDays(firstCell,i); const idx=planIndex(d); const b=document.createElement('button'); b.type='button'; b.className='day';
  if(d.getMonth()!==view.getMonth()) b.classList.add('muted'); if(idx>=0)b.classList.add('plan'); if(iso(d)===iso(selected))b.classList.add('selected'); if(iso(d)===todayIso)b.classList.add('today');
  b.innerHTML=`<span>${d.getDate()}</span>${idx>=0?`<span class="tag">DAY ${idx+1}</span>`:''}`; b.setAttribute('aria-label',thaiDate(d)); b.addEventListener('click',()=>{selected=d;renderAll();}); calendar.appendChild(b); }
}
function renderSchedule(){
 scheduleDate.textContent=thaiDate(selected); const idx=planIndex(selected); list.innerHTML='';
 if(idx<0){ dayNo.hidden=true; backupTitle.hidden=true; backupList.innerHTML=''; status.textContent='วันที่นี้อยู่นอกช่วงแผน 30 วัน กรุณาเลือกวันที่ที่มีคำว่า DAY ในปฏิทิน'; list.innerHTML='<div class="empty">ไม่มีหัวข้อที่กำหนดไว้สำหรับวันนี้</div>'; return; }
 dayNo.hidden=false; dayNo.textContent=`DAY ${idx+1} / 30`; status.textContent=`วันนี้มี 5 คลิป · เวลาโพสต์ ${times.join(' · ')} น.`;
 schedule[idx].forEach((topic,i)=>{ const el=document.createElement('div'); el.className='item'; el.innerHTML=`<div class="time">${times[i]}</div><div><div class="topic-row"><div class="topic">${topic}</div><button type="button" class="copy-btn" data-copy="${encodeURIComponent(topic)}">คัดลอก</button></div><div class="meta">คลิปที่ ${i+1} ของวัน</div></div>`; list.appendChild(el); });
 backupTitle.hidden=false; backupList.innerHTML=''; backups[idx].forEach((topic,i)=>{ const el=document.createElement('div'); el.className='backup-item'; el.innerHTML=`<div class="topic-row"><div><span class="backup-badge">สำรอง ${i+1}</span>${topic}</div><button type="button" class="copy-btn" data-copy="${encodeURIComponent(topic)}">คัดลอก</button></div>`; backupList.appendChild(el); });
}
function renderAll(){renderCalendar();renderSchedule();}
startInput.addEventListener('change',()=>{if(!startInput.value)return;start=fromISO(startInput.value);selected=new Date(start);view=new Date(start.getFullYear(),start.getMonth(),1);localStorage.setItem('tsck-start',startInput.value);renderAll();});
document.getElementById('prevMonth').addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);renderCalendar();});
document.getElementById('nextMonth').addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);renderCalendar();});
document.getElementById('firstBtn').addEventListener('click',()=>{selected=new Date(start);view=new Date(start.getFullYear(),start.getMonth(),1);renderAll();});
document.getElementById('todayBtn').addEventListener('click',()=>{selected=new Date();view=new Date(selected.getFullYear(),selected.getMonth(),1);renderAll();});
document.getElementById('prevDay').addEventListener('click',()=>{selected=addDays(selected,-1);view=new Date(selected.getFullYear(),selected.getMonth(),1);renderAll();});
document.getElementById('nextDay').addEventListener('click',()=>{selected=addDays(selected,1);view=new Date(selected.getFullYear(),selected.getMonth(),1);renderAll();});
async function copyText(text,btn){ let ok=false; try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);ok=true;}}catch(e){} if(!ok){const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{ok=document.execCommand('copy');}catch(e){ok=false;}ta.remove();} if(ok){const old=btn.textContent;btn.textContent='คัดลอกแล้ว';btn.classList.add('copied');setTimeout(()=>{btn.textContent=old;btn.classList.remove('copied');},1200);}else{btn.textContent='คัดลอกไม่ได้';setTimeout(()=>{btn.textContent='คัดลอก';},1200);}}
document.querySelector('.wrap').addEventListener('click',(e)=>{const btn=e.target.closest('.copy-btn');if(!btn)return;const text=decodeURIComponent(btn.dataset.copy||'');copyText(text,btn);});
renderAll();
})();
