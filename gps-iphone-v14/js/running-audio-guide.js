/* Progress announcements use measured GPS distance, never the planned route. */
(function(root){
  'use strict';
  function create(){
    let id=null,km=0,lastMs=0,lastPhase=null,pending=null,finished=false;
    return {update(live){
      const s=live.session;if(!s?.sessionId)return [];
      const measured=!live.timerOnly&&s.gps?.hasMeasurements===true;
      const distance=measured?Math.max(0,Number(s.distanceMeters)||0):0;
      const elapsed=Math.max(0,Number(s.activeMs)||0),whole=Math.floor(distance/1000),events=[];
      if(s.sessionId!==id){id=s.sessionId;km=whole;lastMs=elapsed;lastPhase=null;pending=null;finished=false;}
      if(live.state==='paused')return events;
      if(live.state==='finished'){
        if(!finished){finished=true;pending=null;events.push({kind:'finished'});}
        return events;
      }
      if(live.state!=='running')return events;
      if(live.phase==='rest'&&lastPhase!=='rest'&&live.remainingSec>6)events.push({kind:'rest',seconds:live.remainingSec});
      lastPhase=live.phase;
      if(measured&&whole>km){pending={kind:'kilometre',kilometres:whole,totalSeconds:Math.round(elapsed/1000),lapSeconds:whole===km+1&&lastMs>0?Math.round((elapsed-lastMs)/1000):null};km=whole;lastMs=elapsed;}
      // Leave the last seconds and phase signals free of progress speech.
      if(pending&&live.phase==='work'&&live.remainingSec>8){events.push(pending);pending=null;}
      return events;
    }};
  }
  const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else root.PACRunningAudioGuide=api;
})(globalThis);
