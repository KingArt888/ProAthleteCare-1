/* Design preview. Synthetic fixtures only: no authentication, network, storage or imported files. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
 const names=['Артем Коваль','Максим Бондар','Данило Мельник','Олексій Шевченко','Ілля Ткаченко','Назар Мороз','Роман Савчук','Денис Петренко'];
 const positions=['Центральний захисник','Крайній захисник','Півзахисник','Нападник','Півзахисник','Крайній нападник','Захисник','Нападник'];
 const weights=[.91,1.07,1.13,1.02,1.05,.98,.89,1.09],cycles=[.80,.90,1.01,.66,.87,.98,1.10,.72,.95,1.07,1.20,.79];
 const players=names.map((name,p)=>({id:'demo-'+p,name,position:positions[p],weeks:cycles.map((c,w)=>{const f=c*weights[p]*(1+.035*Math.sin(p+w));return{distance:Math.round(26400*f),load:Math.round(1630*f),hsr:Math.round(1520*f*(1+.08*Math.cos(w+p))),sprint:Math.round(380*f*(1+.13*Math.sin(w+p))),acc:Math.round(142*f),dec:Math.round(136*f),max:Math.round((28.5+p*.35+Math.sin(w+p)*1.1)*10)/10}})}));
 const metrics={distance:{label:'Дистанція',unit:'км',color:'#FFC72C',divide:1000},load:{label:'Player Load',unit:'a.u.',color:'#FFC72C',divide:1},hsr:{label:'HSR',unit:'м',color:'#65ccb7',divide:1},sprint:{label:'Sprint',unit:'м',color:'#FFC72C',divide:1},acc:{label:'Прискорення',unit:'подій',color:'#FFC72C',divide:1},dec:{label:'Гальмування',unit:'подій',color:'#65ccb7',divide:1}};
 window.PACCoachDashboard.start({players,metrics});
})();
