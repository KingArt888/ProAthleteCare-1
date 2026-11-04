(function(){
const keys=['pac_imported_drill_library','pac_drill_editor_draft','pac_drill_editor_draft_backup'];
function report(){document.getElementById('report').textContent=keys.map(k=>{const raw=localStorage.getItem(k);let data;try{data=JSON.parse(raw)}catch{}return k+': '+(raw?Math.round(raw.length/1024):0)+' Ki characters; '+(Array.isArray(data)?data.length+' exercises':data?.title||'')+(data?.motionClips?' / '+data.motionClips.length+' actions':'');}).join('\n');}
report();
const list=JSON.parse(localStorage.getItem(keys[0])||'[]');
document.getElementById('report').textContent+='\n'+list.map(x=>x.title+': '+JSON.stringify(x).length+' chars; '+Object.entries(x).map(([k,v])=>[k,JSON.stringify(v)?.length||0]).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x.join('=')).join(', ')).join('\n');
document.getElementById('report').textContent+='\nLossless library packing: '+JSON.stringify(list.map(PACDrillLocalStorage.pack)).length+' chars';
document.getElementById('archive').onclick=async()=>{const status=document.getElementById('result');try{
const snapshot=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('pac-drill-recovery',1);r.onupgradeneeded=()=>r.result.createObjectStore('snapshots');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
const id=Date.now();await new Promise((resolve,reject)=>{const t=db.transaction('snapshots','readwrite');t.objectStore('snapshots').put(snapshot,id);t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error)});
const verified=await new Promise((resolve,reject)=>{const r=db.transaction('snapshots').objectStore('snapshots').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
if(JSON.stringify(verified)!==JSON.stringify(snapshot))throw Error('Backup verification failed');
const before=localStorage.getItem(keys[0]); const packed=JSON.stringify(JSON.parse(before||'[]').map(PACDrillLocalStorage.pack));
if(JSON.stringify(JSON.parse(packed).map(PACDrillLocalStorage.unpack))!==JSON.stringify(JSON.parse(before||'[]')))throw Error('Library round trip failed');
localStorage.setItem(keys[0],packed);

status.textContent='Verified backup '+id+'. Library packed without losing data; both drafts retained.';report();db.close();
}catch(e){status.textContent='No data removed: '+e.message}};
})();