let data={students:[],routes:[]};
const dayNames=['Segunda','Terça','Quarta','Quinta','Sexta'];

async function loadData(){
  const res=await fetch('data/schedule.json');
  data=await res.json();
  populateDaySelect();
  render();
  requestNotificationPermission();
  scheduleReminders();
}
// cola isto na consola para ver o que o teu script tem
console.log('Existem elementos children?', typeof children, children && children.length);
console.log('Exemplo de cada pickupDate:', children && children.slice(0,5).map(c=>c.pickupDate));
function populateDaySelect(){
  const sel=document.getElementById('daySelect');
  sel.innerHTML='';
  const today=new Date();
  for(let i=0;i<7;i++){
    const d=new Date();
    d.setDate(today.getDate()+i);
    const txt=d.toLocaleDateString('pt-PT',{weekday:'short',day:'2-digit',month:'2-digit'});
    const opt=document.createElement('option');
    opt.value=dayNames[d.getDay()];
    opt.textContent=txt;
    sel.appendChild(opt);
  }
  sel.value=dayNames[today.getDay()];
  sel.addEventListener('change',render);
}

function render(){
  const day=document.getElementById('daySelect').value;
  const tbody=document.getElementById('tbody');
  tbody.innerHTML='';
  const list=data.students.filter(s=>s.days.includes(day));
  list.sort((a,b)=>a.time.localeCompare(b.time));
  list.forEach(s=>{
    const tr=document.createElement('tr');
    const checked=s.confirmed?'checked':'';
    tr.innerHTML=`<td>${s.time}</td><td>${s.name}</td><td>${s.school}</td><td>${s.notes||''}</td>
    <td><input type="checkbox" data-id="${s.id}" ${checked}></td>`;
    tbody.appendChild(tr);
  });
  document.querySelectorAll('input[type=checkbox]').forEach(cb=>{
    cb.addEventListener('change',e=>{
      const id=Number(e.target.dataset.id);
      const st=data.students.find(x=>x.id===id);
      st.confirmed=e.target.checked;
      saveLocal();
    });
  });
}

function saveLocal(){ localStorage.setItem('recolha_data',JSON.stringify(data)); }
function loadLocal(){ const s=localStorage.getItem('recolha_data'); if(s) data=JSON.parse(s); }

document.getElementById('resetBtn').addEventListener('click',()=>{
  data.students.forEach(s=>s.confirmed=false);
  saveLocal();
  render();
});

// Notifications
function requestNotificationPermission(){
  if('Notification' in window){
    Notification.requestPermission();
  }
}
function scheduleReminders(){
  if(!('Notification' in window)) return;
  const today=new Date();
  const day=dayNames[today.getDay()];
  const todays=data.students.filter(s=>s.days.includes(day));
  todays.forEach(s=>{
    if(!s.time) return;
    const [hh,mm]=s.time.split(':').map(Number);
    const sched=new Date(); sched.setHours(hh,mm,0,0);
    sched.setMinutes(sched.getMinutes()-20); // 20 min antes
    const delay=sched.getTime()-Date.now();
    if(delay>0){
      setTimeout(()=>{
        new Notification('Recolha Escolar',{body:`${s.name} - ${s.school} às ${s.time}`});
      },delay);
    }
  });
}

window.addEventListener('load',()=>{ loadLocal(); loadData(); });
