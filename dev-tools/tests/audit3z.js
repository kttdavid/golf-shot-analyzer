const {chromium}=require('playwright');
const D=[ // cs,aoa,path,dl,face,sl,f2p,off,ht,apex,carry,side(yd, +R),launch_dir,spin_axis,ball,launch,spin,lowpt,swdir,plane,rad
[83.7,-4.9,-0.1,22.2,-0.8,27.2,-0.7,null,null,91,166.1,-3.5,-0.7,-1.0,117.7,17.2,5840,4.8,-3.4,57.3,47],
[84.1,-3.6,0.0,22.5,-1.2,26.2,-1.2,-5,-26,88,163.3,-6.7,-1.0,-2.4,115.5,17.5,5680,3.0,-2.4,59.9,41],
[81.8,-4.8,-2.4,21.3,-1.4,26.1,1.0,3,4,87,167.8,-2.0,-1.6,1.9,117.9,16.5,5570,4.1,-5.8,55.9,40.5],
[82.4,-4.4,-1.8,22.9,2.1,27.6,3.9,7,3,89,161.1,13.2,1.2,6.7,115.8,17.6,6182,3.9,-5.1,54.7,40.5],
[83.1,-4.6,-1.0,21.5,1.8,26.3,2.8,11,15,87,166.8,11.4,1.3,5.3,117.2,16.8,5530,4.1,-4.7,53.7,40.5],
[83.4,-4.2,-0.8,22.6,0.7,26.9,1.5,4,16,89,163.5,5.4,0.4,2.9,116.0,17.6,5790,3.6,-3.7,57.7,40],
[82.9,-4.0,-1.4,20.2,-1.7,24.3,-0.3,18,7,78,165.0,-6.7,-1.6,-1.5,115.3,15.7,5150,3.7,-4.5,54.0,42],
[84.0,-4.9,1.3,22.8,1.1,27.8,-0.2,7,11,93,165.5,2.8,1.1,-0.3,117.1,17.9,5778,4.8,-1.9,57.8,46],
[82.4,-5.6,-1.0,22.2,1.2,27.9,2.2,-1,10,89,164.7,8.3,0.7,4.2,117.1,17.1,5910,4.9,-5.2,55.3,40.5],
[82.2,-5.4,-0.4,20.8,-1.1,26.2,-0.7,9,11,84,167.0,-5.0,-1.0,-1.5,117.1,16.1,5440,4.8,-4.5,54.3,41.5]];
const mk=(r,club='7 iron')=>({club,club_speed:r[0],aoa:r[1],path:r[2],dyn_loft:r[3],face_angle:r[4],spin_loft:r[5],impact_offset:r[7],impact_height:r[8],apex:r[9],carry:r[10],offline:r[11],launch_dir:r[12],spin_axis:r[13],ball_speed:r[14],launch:r[15],spin:r[16],low_point:r[17],swing_dir:r[18],swing_plane:r[19],swing_radius:r[20]});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:430,height:900}});const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
await p.goto('file://'+require('path').resolve(__dirname,'../../public/index.html'));
const scen=[
 ['A ball only (carry, side, apex, ball speed, launch, spin, spin axis)',{level:'mid',hand:'right',mode:'normal'},'ball'],
 ['B club only (club speed, aoa, path, face, dyn loft)',{level:'mid',hand:'right',mode:'normal'},'clubonly'],
 ['C basic sim (carry, ball speed, launch, spin only)',{level:'mid',hand:'right',mode:'normal'},'basic'],
 ['D club path+face only',{level:'mid',hand:'right',mode:'normal'},'pathface'],
 ['E carry + total only',{level:'mid',hand:'right',mode:'normal'},'carryonly'],
 ['F mixed: 5 ball-only shots + 5 club-only shots',{level:'mid',hand:'right',mode:'normal'},'split'],
];
for(const [name,cfg,kind] of scen){
 await p.reload();
 const r=await p.evaluate(({cfg,kind,D})=>{
  const mk=(r,club='7 iron')=>({club,club_speed:r[0],aoa:r[1],path:r[2],dyn_loft:r[3],face_angle:r[4],spin_loft:r[5],impact_offset:r[7],impact_height:r[8],apex:r[9],carry:r[10],offline:r[11],launch_dir:r[12],spin_axis:r[13],ball_speed:r[14],launch:r[15],spin:r[16],low_point:r[17],swing_dir:r[18],swing_plane:r[19],swing_radius:r[20]});
  level=cfg.level;hand=cfg.hand;mode=cfg.mode;shape=cfg.shape||null;traj=cfg.traj||null;club='Mid iron (5-7)';
  let sh;
  if(kind==='all')sh=D.map(r=>mk(r));
  else if(kind==='mirror')sh=D.map(r=>{const s=mk(r);['offline','launch_dir','spin_axis','face_angle','path','swing_dir'].forEach(k=>{if(s[k]!=null)s[k]=-s[k]});return s});
  else if(kind==='ball')sh=D.map(r=>({club:'7 iron',carry:r[10],offline:r[11],apex:r[9],ball_speed:r[14],launch:r[15],spin:r[16],launch_dir:r[12],spin_axis:r[13]}));
  else if(kind==='clubonly')sh=D.map(r=>({club:'7 iron',club_speed:r[0],aoa:r[1],path:r[2],dyn_loft:r[3],face_angle:r[4],spin_loft:r[5]}));
  else if(kind==='basic')sh=D.map(r=>({club:'7 iron',carry:r[10],ball_speed:r[14],launch:r[15],spin:r[16]}));
  else if(kind==='pathface')sh=D.map(r=>({club:'7 iron',path:r[2],face_angle:r[4]}));
  else if(kind==='carryonly')sh=D.map(r=>({club:'7 iron',carry:r[10]}));
  else if(kind==='split')sh=D.map((r,i)=>i<5?{club:'7 iron',carry:r[10],offline:r[11],apex:r[9],ball_speed:r[14],launch:r[15],spin:r[16],launch_dir:r[12],spin_axis:r[13]}:{club:'7 iron',club_speed:r[0],aoa:r[1],path:r[2],dyn_loft:r[3],face_angle:r[4],spin_loft:r[5]});
  else if(kind==='three')sh=D.slice(0,3).map(r=>mk(r));
  else if(kind==='one')sh=D.slice(0,1).map(r=>mk(r));
  else if(kind==='mixed')sh=D.map((r,i)=>mk(r,i<5?'7 iron':'Driver'));
  else if(kind==='noapex')sh=D.map(r=>{const s=mk(r);delete s.apex;return s});
  else sh=[];
  const out={};
  try{out.know=knowledge(sh);}catch(e){return {err:'knowledge: '+e.message+' '+(e.stack||'').split('\n')[1]}}
  try{out.intent=intentText()}catch(e){out.intenterr=e.message}
  try{show('p2');drawFlight();out.avail=document.getElementById('avail').innerText.replace(/\n+/g,' | ');out.availHidden=document.getElementById('availc').classList.contains('hide');out.dispHidden=document.getElementById('disp').parentElement.classList.contains('hide');out.disp=(document.getElementById('disp').innerText||'').replace(/\n+/g,' | ').slice(0,500);out.rules=availRules();setLang('zh');out.zh=['availc','disp','flight','bridge','cons'].map(i=>document.getElementById(i).innerText).join('\n').split('\n').filter(x=>/[A-Za-z]{4,}/.test(x));out.flight=document.getElementById('flight').innerText.replace(/\n+/g,' | ').slice(0,700);out.cons=document.getElementById('cons').innerText.replace(/\n+/g,' | ').slice(0,900);out.bridge=document.getElementById('bridge').innerText.replace(/\n+/g,' | ').slice(0,1400)}catch(e){out.drawerr=e.message+' '+(e.stack||'').split('\n').slice(0,3).join(' <- ')}
  try{draw({summary:'Test **x**',kpis:[],strengths:['a'],weaknesses:[],limits:['n']});draw({summary:'S',weaknesses:[{title:'T',plain:'p',evidence:'e',factor:'f',objective:'o',confidence:'measured'}],strengths:[],limits:[]})}catch(e){out.drawAIerr=e.message+' '+(e.stack||'').split('\n')[1]}
  return out},{cfg,kind,D});
 console.log('\n=== '+name);
 if(r.err){console.log('ERR',r.err);continue}
 for(const k of ['intenterr','drawerr','drawAIerr'])if(r[k])console.log(k,r[k]);
 
 console.log('ZH LEFTOVER:',JSON.stringify(r.zh));
}
console.log('\nERRORS:',errs.join(' || ')||'none');await b.close()})();
