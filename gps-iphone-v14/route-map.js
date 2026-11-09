/* Read-only geographic view of accepted GPS samples. No GPS watcher or persistence. */
(function(root){
 'use strict';
 const panel=document.getElementById('gpsRoutePanel');if(!panel)return;
 const host=document.createElement('div');host.id='outdoorRouteMap';host.hidden=true;host.setAttribute('aria-label','Recorded GPS route on a geographic map');
 const message=document.createElement('p');message.id='outdoorMapStatus';message.className='route-note';message.setAttribute('role','status');
 const controls=document.createElement('div');controls.className='outdoor-map-controls';
 controls.innerHTML='<button type="button" class="btn btn-outline" id="outdoorMapFit">Увесь маршрут · Fit</button><button type="button" class="btn btn-outline" id="outdoorMapRetry" hidden>Повторити карту · Retry</button>';
 panel.insertBefore(host,document.getElementById('routeMap'));panel.append(controls,message);controls.hidden=true;
 let map=null,tiles=null,layers=null,bounds=null,loaded=false,current=null,observer=null;
 function split(route){
  const segments=[];let part=[],last=null;
  for(const p of route||[]){
   if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||Math.abs(p.lat)>90||Math.abs(p.lng)>180){if(part.length)segments.push(part);part=[];last=null;continue;}
   if(part.length&&(p.newSegment||Number.isFinite(p.timestamp)&&Number.isFinite(last?.timestamp)&&p.timestamp-last.timestamp>10000)){segments.push(part);part=[];}
   part.push([p.lat,p.lng]);last=p;
  }
  if(part.length)segments.push(part);return segments;
 }
 function fit(){if(!map||!bounds||!host.clientWidth||!host.clientHeight)return;map.invalidateSize({pan:false});map.fitBounds(bounds,{padding:[28,28],maxZoom:18,animate:false});if(!map.hasLayer(tiles))tiles.addTo(map);}
 function init(){
  if(map)return true;
  if(!root.L||!root.PACMapProviders){message.textContent='Карта недоступна. Нижче показано схему записаного маршруту.';return false;}
  map=L.map(host,{scrollWheelZoom:false,attributionControl:true});layers=L.layerGroup().addTo(map);
  tiles=L.tileLayer(root.PACMapProviders.tileUrl,{maxZoom:root.PACMapProviders.tileMaxZoom||19,
   attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'});
  tiles.on('tileload',()=>{loaded=true;message.textContent='Карта © OpenStreetMap · зелений — початок, червоний — кінець. Розриви GPS не з’єднуються.';document.getElementById('outdoorMapRetry').hidden=true;});
  tiles.on('tileerror',()=>{message.textContent='Частина карти недоступна. Перевір інтернет: GPS-маршрут збережений. Розриви сигналу не з’єднуються.';document.getElementById('outdoorMapRetry').hidden=false;});
  observer=new ResizeObserver(()=>{if(host.clientWidth&&host.clientHeight)fit();});observer.observe(host);return true;
 }
 function show(session){
  current=session;const segments=split(session.route),points=segments.flat();
  host.hidden=!points.length;controls.hidden=!points.length;
  if(!points.length){layers?.clearLayers();if(map&&tiles&&map.hasLayer(tiles))map.removeLayer(tiles);message.textContent='Немає записаних GPS-точок. Карта не створюється з планової дистанції.';return false;}
  if(!init()){host.hidden=true;controls.hidden=true;return false;}
  layers.clearLayers();for(const segment of segments){if(segment.length>1)L.polyline(segment,{color:'#c59700',weight:5,opacity:.95}).addTo(layers);else L.circleMarker(segment[0],{radius:3,color:'#b08600'}).addTo(layers);}
  L.circleMarker(points[0],{radius:7,color:'#fff',weight:2,fillColor:'#159858',fillOpacity:1}).bindTooltip('Початок · Start').addTo(layers);
  L.circleMarker(points.at(-1),{radius:7,color:'#fff',weight:2,fillColor:'#d63242',fillOpacity:1}).bindTooltip('Кінець · Finish').addTo(layers);
  bounds=L.latLngBounds(points);loaded=false;message.textContent='Завантаження карти… GPS-точок: '+points.length+' · сегментів: '+segments.length+'.';
  requestAnimationFrame(fit);return true;
 }
 document.getElementById('outdoorMapFit').onclick=fit;
 document.getElementById('outdoorMapRetry').onclick=()=>{loaded=false;tiles?.redraw();};
 root.PACRouteMap={show,split,getMap:()=>map,getLayers:()=>layers};
})(window);
