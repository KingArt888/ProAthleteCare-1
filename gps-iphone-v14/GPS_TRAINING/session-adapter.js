/* Pure future handoff envelope. Does not write or invoke Session Repository.
   Repository currently rejects GPS/execution fields: keep them in extensions. */
(function(root) {
  function prepare(session, context = {}) {
    if (!session.sessionId || !session.endTime) throw Error('Finished GPS session required');
    const task = context.task || null;
    if (task && (task.mode !== 'running' || (task.sessionId && task.sessionId !== session.sessionId))) throw Error('GPS task mismatch');
    const metric = (value,unit,provider='browser-geolocation') => ({value,unit,source:'measured',provider,
      recordedAt:session.endTime,quality:{status:'partial',validation:'client'}});
    const gpsMetric=(value,unit)=>session.gps&&!session.gps.hasMeasurements?{value:null,unit,source:'unavailable'}:metric(value,unit);
    return {
      sessionId:session.sessionId,
      input:{date:session.day,timezone:session.timezone,timePrecision:'instant',
        startedAt:session.startTime,endedAt:session.endTime,status:'completed',
        context:{weekId:task?.context?.weekId || context.weekId || null,dayIdx:task?.context?.dayIdx ?? context.dayIdx ?? null},
        actual:{duration:metric(session.activeMs/60000,'min','browser-clock'),distance:gpsMetric(session.distanceMeters/1000,'km'),
          maxSpeed:gpsMetric(session.maxSpeedKmh,'km/h')}},
      extensions:{activityType:session.activityType,exerciseExecutionId:task?.executionId || context.exerciseExecutionId || null,
        exerciseId:task?.exerciseId || context.exerciseId || null,drillId:context.drillId || null,
        task:task ? JSON.parse(JSON.stringify(task)) : null,
        runningIntervals:session.runningIntervals || [],gps:session.gps || null,fieldSelection:session.fieldSelection?JSON.parse(JSON.stringify(session.fieldSelection)):null,
        elapsedMs:session.elapsedMs,activeMs:session.activeMs,movingMs:session.movingMs,
        quality:session.quality,provenance:session.provenance,routeRef:session.routeRef,
        speedZones:{source:'unavailable',quality:'unvalidated',definitionVersion:'test-running-v1',
          applicableActivities:['run'],zones:[['Z1',0,7],['Z2',7,14],['Z3',14,19],['HSR',19,25],['Sprint',25,null]]
            .map(([id,minKmh,maxKmh])=>({id,minKmh,maxKmh,distance:null,time:null,source:'unavailable',quality:'unvalidated'}))},
        acceleration:{unit:'m/s2',status:'unavailable',threshold:null,minEffortMs:null,noiseFilter:null},
        calories:{value:null,source:'unavailable',futureInputs:['bodyMassKg','activityType','activeDuration']},
        sync:{status:'local-only',idempotencyKey:session.sessionId,loadContribution:'requires-explicit-reconciliation'}}
    };
  }
  if(typeof module==='object') module.exports={prepare}; else root.PACGPSAdapter={prepare};
})(globalThis);
