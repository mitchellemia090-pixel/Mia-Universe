/* Recover the old weighted/segmented cloud, with explicit word-only masks.
   Source: before-word-only-clouds-20261110-233834. Counts/indices stay in reportData. */
(() => {
 const NS='http://www.w3.org/2000/svg',canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 const svg=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e};
 const shortEnglish={'推荐':'recommend','热情':'hospitality','想去':'want to go','特色':'character','南方':'South','北方':'North','东北人':'northeasterners','冰雪大世界':'Ice & Snow World','西北':'Northwest','景点':'sights','政府':'govt.','才是':'what matters'};
 const label=(item,T)=>T.en()?(shortEnglish[item.word]||T.word(item.word)):item.word;
 const cache=new Map();
 function ringPack(items,city,w,h,factor,maxRate,T){
  const fail=phase=>{if(window.MIA_CLOUD_DEBUG)(window.MIA_CLOUD_TRIALS??=[]).push({city,w,h,factor,phase});return null};
  const boxes=[],byWord=new Map(items.map((item,index)=>[item.word,{item,index,text:label(item,T)}]));
  const size=item=>14+(w>=440?40:22)*factor*Math.sqrt(item.rate/maxRate);
  const width=v=>{ctx.font=`650 ${size(v.item)}px Arial, "Microsoft YaHei", sans-serif`;return ctx.measureText(v.text).width};
  const take=words=>words.map(k=>{const v=byWord.get(k);byWord.delete(k);return v});
  function line(v,cx,cy,region,rotation=0){const font=size(v.item),bw=width(v)+6,bh=font*1.1+6;boxes.push({...v,font,region,rotation,x:cx-(rotation?bh:bw)/2,y:cy-(rotation?bw:bh)/2,w:rotation?bh:bw,h:rotation?bw:bh});}
  function along(vs,points,region){
   const distances=[0];for(let i=1;i<points.length;i++)distances.push(distances.at(-1)+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
   const total=distances.at(-1),widths=vs.map(width),gap=(total-widths.reduce((a,b)=>a+b,0))/vs.length;if(gap<9)return false;
   const at=d=>{d=Math.max(0,Math.min(total,d));let i=1;while(i<distances.length-1&&distances[i]<d)i++;const t=(d-distances[i-1])/(distances[i]-distances[i-1]||1);return[points[i-1][0]+t*(points[i][0]-points[i-1][0]),points[i-1][1]+t*(points[i][1]-points[i-1][1])]};
   let cursor=gap/2;
   for(let i=0;i<vs.length;i++){const center=cursor+widths[i]/2,extent=widths[i]+8,segment=Array.from({length:24},(_,j)=>at(center-extent/2+extent*j/23)),a=segment[0],b=segment.at(-1);if(b[0]<a[0])segment.reverse();const path=segment.map((p,j)=>(j?'L':'M')+p[0].toFixed(2)+' '+p[1].toFixed(2)).join(' ');boxes.push({...vs[i],font:size(vs[i].item),region,path});cursor+=widths[i]+gap}
   return true;
  }
  const ellipse=(cx,cy,rx,ry)=>Array.from({length:501},(_,i)=>{const a=-Math.PI/2+i/500*Math.PI*2;return[cx+rx*Math.cos(a),cy+ry*Math.sin(a)]});
  let inner,main;
  if(city==='哈尔滨'){
   const crown=take(['冬天','黑龙江']),brim=take(['推荐']);
   if(crown.some(v=>width(v)>w*.48)||width(brim[0])>w*.76)return fail('hat');
   line(crown[0],w*.5,h*.045,0);line(crown[1],w*.5,h*.085,0);line(brim[0],w*.5,h*.135,1);
   const head=take(['美食','好吃','本地','淄博','夏天','朋友','欢迎','附近','开心']);
   if(!along(head,ellipse(w*.5,h*.285,w*.305,h*.125),2))return fail('head');
   const scarf=take(['热情','服务']);if(width(scarf[0])>w*.67)return fail('scarf');line(scarf[0],w*.49,h*.425,3);line(scarf[1],w*.5,h*.455,3);
   const outline=take(['南方','北方','想去','真诚','小土豆','特色','东北人','才是']);if(!along(outline,ellipse(w*.5,h*.71,w*.445,h*.245),4))return fail('body-ring');
   main=[...byWord.values()];inner={bounds:[w*.16,h*.53,w*.68,h*.35],inside:(x,y)=>((x-w*.5)/(w*.35))**2+((y-h*.705)/(h*.18))**2<=1};
  }else{
   const steam=take(['好吃','西北','美食','流量','烧烤','经济','发展','挺好']);
   for(let i=0;i<steam.length;i++){const v=steam[i],length=width(v)+6;if(length>h*.25)return fail('steam');line(v,w*(.15+i*.10),h*.15+(i%2?10:-10),0,-90)}
   const rim=take(['文化','历史','本地','游客','淄博','伏羲','眼睛','西安','服务','政府']);if(!along(rim,ellipse(w*.5,h*.345,w*.47,h*.065),1))return fail('rim');
   const remaining=[...byWord.values()].sort((a,b)=>b.item.rate-a.item.rate),outline=remaining.slice(6),curve=[],top=h*.40,depth=w*.80;
   const bez=(a,b,c,d,t)=>a*(1-t)**3+3*b*(1-t)**2*t+3*c*(1-t)*t*t+d*t**3;
   for(let i=0;i<=250;i++){const t=i/250;curve.push([bez(.055,.12,.28,.5,t)*w,top+bez(0,.60,1,1,t)*depth])}
   for(let i=1;i<=250;i++){const t=i/250;curve.push([bez(.5,.72,.88,.945,t)*w,top+bez(1,1,.60,0,t)*depth])}
   if(!along(outline,curve,2))return fail('bowl-outline');main=remaining.slice(0,6);inner={bounds:[w*.20,top+depth*.09,w*.6,depth*.74],inside:(x,y)=>{const t=(y-top)/depth;return t>=0&&t<=.84&&Math.abs(x-w*.5)<w*(.34-.16*t*t)}};
  }
  const groups=main.map(v=>[v]);if(city==='天水'){groups.sort((a,b)=>width(a[0])-width(b[0]));groups.splice(0,2,[...groups[0],...groups[1]])}
  const groupWidth=g=>g.reduce((n,v)=>n+width(v)+6,0)+(g.length-1)*8;
  groups.sort((a,b)=>groupWidth(b)-groupWidth(a));const slots=groups.map((_,i)=>i).sort((a,b)=>Math.abs(a-(groups.length-1)/2)-Math.abs(b-(groups.length-1)/2));
  for(let i=0;i<groups.length;i++){
   const group=groups[i],bw=groupWidth(group),bh=Math.max(...group.map(v=>size(v.item)*1.1+6)),bounds=inner.bounds,cy=bounds[1]+bounds[3]*(slots[i]+.5)/groups.length,cx=w*.5;
   if(bh>bounds[3]/groups.length||![[cx-bw/2,cy-bh/2],[cx+bw/2,cy-bh/2],[cx-bw/2,cy+bh/2],[cx+bw/2,cy+bh/2]].every(([x,y])=>inner.inside(x,y)))return fail('rows-'+group.map(v=>v.item.word));
   let x=cx-bw/2;for(const v of group){const vw=width(v)+6;line(v,x+vw/2,cy,4);x+=vw+8}
  }
  return boxes;
 }
 function layout(data,w,T){
  const key=(T.en()?'en':'zh')+':'+w;if(cache.has(key))return cache.get(key);
  const maxRate=Math.max(...Object.values(data).flat().map(x=>x.rate));
  // Both cities use one sqrt(rate / global max) size mapping and the same fitting factor.
  for(const [factor,extra]of [[1,0],[.85,0],[.7,0],[.7,120],[.55,0],[.55,120],[.7,240],[.55,240],[.4,0],[.4,120],[.25,0],[.25,120],[.25,240],[.15,420]]){
   const h=Math.round((w<440?700:850)+extra),result={};let ok=true;
   for(const city of Object.keys(data)){result[city]=ringPack(data[city],city,w,h,factor,maxRate,T);if(!result[city]){ok=false;break}}
   if(ok){const value={w,h,heights:{'哈尔滨':h,'天水':Math.ceil(h*.40+w*.80+32)},factor,maxRate,boxes:result};cache.set(key,value);return value}
  }
  throw Error('Word-only cloud could not fit all 30 original words at this width.');
 }
 function render(host,city,chart,T,onSelect,note,total){
  host.classList.add('mia-shaped-cloud');host.replaceChildren();host.style.overflow='visible';
  const height=chart.heights[city],root=svg('svg',{viewBox:`0 0 ${chart.w} ${height}`,width:chart.w,height,role:'group','aria-label':T.choose(city==='哈尔滨'?'哈尔滨雪人词云':'天水麻辣烫碗词云',city==='哈尔滨'?'Harbin snowman word cloud':'Tianshui malatang bowl word cloud')});
  const title=svg('title');title.textContent=root.getAttribute('aria-label');root.append(title);
  const defs=svg('defs');root.append(defs);host.append(root);
  if(city==='哈尔滨')for(const x of [.455,.545])root.append(svg('circle',{cx:chart.w*x,cy:chart.h*.27,r:2.5,fill:'#3B1C15','aria-hidden':'true'}));
  if(city==='天水'){
   const sticks=svg('path',{d:`M${chart.w*.955} ${chart.h*.12}L${chart.w*.90} ${chart.h*.32}M${chart.w*.99} ${chart.h*.14}L${chart.w*.945} ${chart.h*.33}`,fill:'none',stroke:'#3B1C15','stroke-width':2,'aria-hidden':'true'});root.append(sticks);
  }
  for(const box of chart.boxes[city]){
   const ink=city==='哈尔滨'?(box.region<2||box.index%4===0?'#3B1C15':'#3D8CDB'):(box.index%3===0?'#3B1C15':'#A2010D');
   const description=T.choose(`${city} · ${box.item.word}：${box.item.count} 条评论 / ${total} 条，占 ${box.item.rate.toFixed(2)}%`,`${T.word(city)} · ${T.word(box.item.word)}: ${box.item.count} of ${total} comments (${box.item.rate.toFixed(2)}%)`);
   const g=svg('g',{role:'button',tabindex:0,'data-word':box.item.word,'data-city':city,'aria-label':description,'class':'cloud-keyword',transform:box.path?'':`translate(${box.x+box.w/2} ${box.y+box.h/2})`});
   const t=svg('title');t.textContent=description;g.append(t);
   const hit=svg('rect',{x:box.path?0:-box.w/2,y:box.path?0:-box.h/2,width:box.w||0,height:box.h||0,rx:2,fill:'transparent'});g.append(hit);
   const text=svg('text',{'text-anchor':'middle','dominant-baseline':'central',fill:ink,'font-size':box.font,'font-weight':650,'font-family':'Arial, Microsoft YaHei, sans-serif',transform:box.path?'':`rotate(${box.rotation})`});
   if(box.path){const id='cloud-'+city+'-'+box.index;defs.append(svg('path',{id,d:box.path}));const path=svg('textPath',{href:'#'+id,startOffset:'50%'});path.textContent=box.text;text.append(path)}else text.textContent=box.text;g.append(text);root.append(g);
   if(box.path){const r=text.getBBox();for(const[k,v]of Object.entries({x:r.x-2,y:r.y-2,width:r.width+4,height:r.height+4}))hit.setAttribute(k,v)}
   const show=()=>note.textContent=description;g.addEventListener('pointerenter',show);g.addEventListener('focus',show);g.addEventListener('click',()=>{show();onSelect(city,box.item)});g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();g.dispatchEvent(new Event('click'))}});root.append(g);
  }
  host.dataset.layout='word-mask';host.dataset.commonScale=chart.factor;host.dataset.wordCount=chart.boxes[city].length;
 }
 window.MIA_TOURISM_CLOUDS={layout,render,aliases:shortEnglish};
})();
