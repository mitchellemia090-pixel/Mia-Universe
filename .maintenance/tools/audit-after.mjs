import fs from 'node:fs';import {Browser,wait} from './browser-audit-lib.mjs';
const out='pages-release-review/fix-20261112/',b=new Browser(),results=[];await b.start();
const state=`(()=>{const vw=document.documentElement.clientWidth;const overflow=[...document.querySelectorAll('body *')].filter(e=>{if(e.closest('dialog:not([open]),[hidden],.responsive-table,.source-table,.table-wrap,.reading-diagram-scroll,.table-scroll,.light-line,.cloud-main,.cloud-rear'))return false;const r=e.getBoundingClientRect();return r.width>0&&(r.right>vw+2||r.left< -2)&&getComputedStyle(e).position!=='fixed'}).slice(0,16).map(e=>({tag:e.tagName,cls:e.className,right:Math.round(e.getBoundingClientRect().right),left:Math.round(e.getBoundingClientRect().left)}));return {url:location.href,width:innerWidth,zoom:visualViewport.scale,scroll:document.documentElement.scrollWidth,overflow,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth&&i.currentSrc).map(i=>i.currentSrc),work:window.MIA_WORK_READY,error:window.MIA_WORK_ERROR,grids:[...document.querySelectorAll('.hero-grid')].map(e=>getComputedStyle(e).gridTemplateColumns)}})()`;
try{
for(const prefix of ['local','Mia-Universe']){const origin='http://127.0.0.1:8782/'+prefix+'/';
for(const width of [1440,1000,768,375]){await b.size(width);await b.call('Network.clearBrowserCache');await b.go(origin);await b.shot(out+prefix+'-home-'+width+'-after.png');results.push({kind:'home',prefix,width,state:await b.ev(state),requests:await b.ev(`performance.getEntriesByType('resource').map(r=>({name:r.name.split('/').pop(),ms:r.duration,bytes:r.encodedBodySize,start:r.startTime}))`)});
console.log('home',prefix,width);await b.go(origin+'#/work');console.log('work',prefix,width);await b.ev(`setTimeout(()=>document.querySelector('[data-sw-project="screenshot"]')?.click(),50);true`);await wait(300);
// Use the real card URL, regardless of internal project id.
if(!(await b.ev('location.pathname')).includes('Someone_Took'))await b.ev(`setTimeout(()=>document.querySelector('a[href*="Someone_Took_a_Screenshot"]')?.click(),50);true`);await wait(1000);
results.push({kind:'selected-entry',prefix,width,state:await b.ev(state)});await b.shot(out+prefix+'-selected-detail-'+width+'-after.png');
await b.go(origin+'projects/Someone_Took_a_Screenshot.html');const clicked=await b.ev(`(()=>{const c=document.querySelector('#capture');c.click();return {notification:document.querySelector('#notification').textContent,button:c.getBoundingClientRect().toJSON()}})()`);results.push({kind:'direct-detail',prefix,width,state:await b.ev(state),clicked});
}
if(prefix==='local')continue;
for(const width of [1440,375]){await b.size(width);for(const file of fs.readdirSync('github-pages-v2/projects').filter(n=>n.endsWith('.html'))){await b.go(origin+'projects/'+file,450);results.push({kind:'all-projects',file,width,state:await b.ev(state)})}console.log('projects',width)}
for(const [file,video] of [['reading-zine.html','zine-report'],['reading-barber.html','barber'],['reading-broadcast.html','broadcast'],['source-haidilao.html','haidilao']]){
await b.size(1440);await b.go(origin+'projects/'+file,1100);
const count=await b.ev(`document.querySelectorAll('video').length`);
if(!count)await b.ev(`(()=>{const v=document.createElement('video');v.controls=true;v.src='../source-media/web/${video}.mp4';document.body.prepend(v)})()`);
const playback=await b.ev(`(async()=>{const v=document.querySelector('video');v.muted=true;v.scrollIntoView({block:'center'});await v.play();await new Promise(r=>setTimeout(r,1500));const first=v.currentTime;v.currentTime=10;await new Promise(r=>setTimeout(r,1300));const result={src:v.currentSrc,duration:v.duration,first,afterSeek:v.currentTime,width:v.videoWidth,height:v.videoHeight,paused:v.paused,error:v.error?.message,decoded:v.getVideoPlaybackQuality().totalVideoFrames};v.pause();return result})()`);results.push({kind:'playback',file,video,integratedPlayer:!!count,playback});await b.shot(out+video+'-playing.png');console.log('played',video,playback.first,playback.afterSeek);
}
}
}finally{fs.writeFileSync(out+'after.json',JSON.stringify(results,null,2));b.stop()}
