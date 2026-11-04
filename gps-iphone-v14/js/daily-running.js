/* Daily uses the existing GPS runtime as its single recorder/timer/sound owner.
   No second GPS algorithm, remote writes or route copy in localStorage. */
(function(root){
  'use strict';
  let frame=null, api=null, key=null, timer=null, notify=null, generation=0, preparing=null;
  let completion=null,localSaved=false,saveError=null;
  let sourceTask=null;
  const copy=value=>JSON.parse(JSON.stringify(value));
  function scope(task){return JSON.stringify([task.context.userId,new Date().toLocaleDateString('sv-SE'),task.context.weekId,task.context.dayIdx,task.context.variantKey,task.context.variantIndex,task.planItemId]);}
  function status(){
    if(!api)return{loading:true};
    const live=api.getLive();
    if(['running','paused','finished'].includes(live.state))live.session=api.getSession({includeRoute:false});
    live.localSaved=localSaved;live.saveError=saveError;
    return live;
  }
  function publish(){
    if(sourceTask?.ready&&api?.getState()==='finished'&&!completion){
      const token=generation,client=api;
      completion=api.flush().then(()=>{if(token!==generation||api!==client)return;localSaved=true;publish();},()=>{if(token!==generation||api!==client)return;saveError='LOCAL_SAVE_FAILED';publish();});
    }
    if(notify)notify(status());
  }
  async function prepare(task,onChange,setupOnly=false){
    if(!setupOnly)root.PACExerciseTask.toGPS(task); // Validate the shared running boundary.
    sourceTask=copy(task);
    const nextKey=scope(task), token=++generation; notify=null;
    clearInterval(timer);
    if(key!==nextKey){
      if(api){api.subscribe(null);api.pause();await api.flush();}
      if(token!==generation)return;
      frame?.remove(); api=null;key=nextKey;
      completion=null;localSaved=false;saveError=null;
      frame=document.createElement('iframe');frame.title='GPS runtime';frame.setAttribute('aria-hidden','true');
      frame.style.cssText='position:fixed;left:-10px;top:-10px;width:1px;height:1px;border:0;opacity:0;pointer-events:none';
      frame.allow='geolocation; autoplay';
      frame.src=`../GPS_TRAINING/index.html?daily=1&owner=${encodeURIComponent(task.context.userId)}&task=${encodeURIComponent(key)}`;
      document.body.append(frame);
    }
    preparing=new Promise((resolve,reject)=>{
      const started=Date.now();
      const poll=()=>{
        if(token!==generation){resolve();return;}
        try{
          const candidate=frame.contentWindow.PAC;
          if(candidate?.getLive().storageReady){
            api=candidate;if(!setupOnly)api.bindTask(copy(task));api.setSound(Boolean(task.soundEnabled));
            if(api.getState()==='finished'){completion=null;localSaved=false;saveError=null;}
            notify=onChange;
            api.subscribe(publish);publish();resolve();return;
          }
        }catch(error){reject(error);return;}
        if(Date.now()-started>15000){reject(Error('GPS_RUNTIME_UNAVAILABLE'));return;}
        setTimeout(poll,100);
      };poll();
    });
    return preparing;
  }
  async function checkGPS(){if(!api)await preparing;if(!api)throw Error('GPS_NOT_READY');const token=generation;const result=await api.requestLocation();if(token!==generation)throw Error('TASK_CHANGED');publish();return result;}
  function start(){if(!api)throw Error('GPS_NOT_READY');root.PACExerciseTask.toGPS(sourceTask);api.start();publish();}
  function pause(){if(api){api.pause();publish();}}
  function resume(){if(api){api.resume();publish();}}
  async function finish(){if(!api)throw Error('GPS_NOT_READY');api.finish();if(saveError){completion=null;saveError=null;localSaved=false;}publish();await completion;if(saveError)throw Error(saveError);return result();}
  function sound(enabled,test=false){api?.setSound(enabled,test);publish();}
  function timerOnly(){if(!api)throw Error('GPS_NOT_READY');api.useTimerOnly();publish();}
  function phoneGPS(){if(!api)throw Error('GPS_NOT_READY');api.usePhoneGPS();publish();}
  function configureField(mode,id){if(!api)throw Error('GPS_NOT_READY');api.configureField(mode,id);publish();}
  function editField(edit=false){
    if(!api)throw Error('GPS_NOT_READY');
    const previous=frame.style.cssText,info=document.getElementById('di-elite-info'),wasOpen=info?.open;
    const background=[...document.body.children].filter(el=>el!==frame&&!el.inert);
    if(wasOpen)info.close();
    background.forEach(el=>el.inert=true);
    frame.removeAttribute('aria-hidden');frame.style.cssText='position:fixed;inset:0;width:100%;height:100dvh;border:0;z-index:2147483647;background:#060606';
    let restored=false;
    const restore=()=>{if(restored)return;restored=true;frame.style.cssText=previous;frame.setAttribute('aria-hidden','true');background.forEach(el=>el.inert=false);if(wasOpen)info.showModal();publish();};
    try{api.editField(edit,restore);frame.focus();}catch(error){restore();throw error;}
  }
  function replay(){
    if(!api||api.getState()!=='finished')throw Error('FINISHED_RUN_REQUIRED');
    const dialog=document.getElementById('di-running-result'),wasOpen=dialog?.open,previous=frame.style.cssText,doc=frame.contentDocument;
    if(wasOpen)dialog.close();const background=[...document.body.children].filter(el=>el!==frame&&!el.inert);background.forEach(el=>el.inert=true);
    frame.removeAttribute('aria-hidden');frame.style.cssText='position:fixed;inset:0;width:100%;height:100dvh;border:0;z-index:2147483647;background:#060606';
    const newTraining=doc.getElementById('btnNewTraining'),oldHidden=newTraining?.hidden;if(newTraining)newTraining.hidden=true;
    const back=doc.createElement('button');back.type='button';back.textContent='← Daily · Підсумок';back.style.cssText='position:fixed;right:12px;top:12px;z-index:2147483647;padding:12px;border-radius:10px;border:1px solid #a98c24;background:#d4af37;color:#080808;font-weight:bold';doc.body.append(back);
    back.onclick=()=>{back.remove();if(newTraining)newTraining.hidden=oldHidden;frame.style.cssText=previous;frame.setAttribute('aria-hidden','true');background.forEach(el=>el.inert=false);if(wasOpen)dialog.showModal();};back.focus();
  }
  async function fresh(task=sourceTask){root.PACExerciseTask.toGPS(task);await completion;if(saveError)throw Error(saveError);sourceTask=copy(task);api.restartTask(copy(sourceTask));completion=null;localSaved=false;saveError=null;publish();}
  function result(){const session=api?.getSession({includeRoute:false});if(!session?.endTime)return null;return root.PACGPSAdapter.prepare(session,{task:session.dailyTask});}
  function detach(){generation++;notify=null;clearInterval(timer);api?.subscribe(null);pause();}
  root.PACDailyRunning={prepare,checkGPS,start,pause,resume,finish,sound,timerOnly,phoneGPS,configureField,editField,replay,status,result,detach,fresh};
})(globalThis);
