(function(){
 'use strict';
 const $=id=>document.getElementById(id),api=window.PACExerciseContent;
 const exercises=Object.values(window.EXERCISE_LIBRARY).flatMap(s=>Object.values(s).flatMap(c=>c.exercises||[]));
 const dialog=$('demo');let activeVideo=null;
 function open(ex){
  $('demo-title').textContent=ex.name_i18n.uk;$('demo-muscles').textContent=ex.description_i18n.uk;
  $('demo-technique').textContent=ex.technique_i18n.uk;$('demo-media').replaceChildren();$('play').hidden=!ex.videoUrl;
  if(ex.videoUrl){
   const v=document.createElement('video');v.src=ex.videoUrl;v.poster=ex.videoPoster;v.muted=true;v.loop=true;v.playsInline=true;v.controls=false;v.disablePictureInPicture=true;v.disableRemotePlayback=true;
   v.setAttribute('webkit-playsinline','');v.setAttribute('aria-label',ex.name_i18n.uk);v.addEventListener('error',()=>{$('demo-technique').textContent='Не вдалося завантажити відео. '+ex.technique_i18n.uk;});
   activeVideo=v;$('demo-media').append(v);v.play().catch(()=>{$('play').textContent='Відтворити';});$('play').textContent='Пауза';
  }else{$('demo-technique').textContent=ex.technique_i18n.uk+' Відеодемонстрація ще не додана.';}
  dialog.showModal();
 }
 function render(){
  const search=$('search').value.trim().toLowerCase(),media=$('media').value;
  const filtered=exercises.filter(e=>(media==='all'||(media==='local'?!!e.videoUrl:!e.videoUrl))&&[e.name,...Object.values(e.name_i18n),e.description_i18n.uk,e.description_i18n.en].join(' ').toLowerCase().includes(search));
  $('library').replaceChildren();$('count').textContent=`Показано ${filtered.length} із ${exercises.length}. Локальних відео: ${exercises.filter(e=>e.videoUrl).length}.`;$('empty').hidden=filtered.length>0;
  for(const e of filtered){
   const card=document.createElement('article'),button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Переглянути: '+e.name_i18n.uk);
   if(e.videoUrl){const img=document.createElement('img');img.src=e.videoPoster;img.alt=e.name_i18n.uk;img.loading='lazy';button.append(img);}else button.textContent='Техніка виконання';
   button.addEventListener('click',()=>open(e));const copy=document.createElement('div');copy.className='copy';
   for(const [tag,cls,text]of [['h2','',e.name_i18n.uk],['p','muscles',e.description_i18n.uk],['p','technique',e.technique_i18n.uk],['p','status',e.videoUrl?'Локальне відео · без YouTube':'Відео ще не додане']]){
    const node=document.createElement(tag);node.className=cls;node.textContent=text;copy.append(node);
   }
   card.append(button,copy);$('library').append(card);
  }
 }
 $('search').addEventListener('input',render);$('media').addEventListener('change',render);
 $('close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{activeVideo?.pause();activeVideo=null;$('demo-media').replaceChildren();});
 $('play').addEventListener('click',()=>{if(!activeVideo)return;if(activeVideo.paused)activeVideo.play().then(()=>{$('play').textContent='Пауза';}).catch(()=>{$('play').textContent='Відтворити';});else{activeVideo.pause();$('play').textContent='Відтворити';}});
 render();
})();
