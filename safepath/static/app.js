const edgeIds = { 'A-B':'edge-AB','B-C':'edge-BC','B-D':'edge-BD','C-E1':'edge-CE1','D-E2':'edge-DE2' };
const labels = {A:'Room A',B:'Room B',C:'Room C',D:'Room D',E1:'Exit 1',E2:'Exit 2'};
function resetMap(){document.querySelectorAll('.edge').forEach(e=>e.classList.remove('route','blocked'));}
function markBlocked(key){const id=edgeIds[key]; if(id) document.getElementById(id).classList.add('blocked');}
function markRoute(path){for(let i=0;i<path.length-1;i++){let a=path[i],b=path[i+1];let key=[a,b].sort().join('-');let id=edgeIds[key];if(id) document.getElementById(id).classList.add('route');}}
async function findRoute(){
  resetMap();
  const start=document.getElementById('start').value;
  const selected=document.getElementById('blocked').value;
  if(selected) markBlocked(selected);
  const blocked=selected?[selected.split('-')]:[];
  const res=await fetch('/api/route',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({start,blocked})});
  const data=await res.json();
  const status=document.getElementById('status'); const result=document.getElementById('result');
  if(!data.found){status.textContent='No accessible route found.';status.className='status warn';result.innerHTML='<h2>Result</h2><p class="warn">🚨 No accessible evacuation route found.</p>';return;}
  markRoute(data.path); status.textContent='Route found successfully.';status.className='status';
  result.innerHTML=`<h2>Evacuation Result</h2><div class="result-card"><div class="metric">Starting Point<strong>${labels[start]}</strong></div><div class="metric">Recommended Exit<strong>${data.exit}</strong></div><div class="metric">Distance<strong>${data.distance} m</strong></div></div><p class="ok"><b>Route:</b> ${data.labels.join(' → ')}</p>`;
}
function simulateBlockage(){
  const start=document.getElementById('start'); if(start.value==='D') start.value='A';
  document.getElementById('blocked').value='C-E1';
  findRoute();
}
