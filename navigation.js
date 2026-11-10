// One configuration for the homepage, page links and shared Mia navigation.
const MIA_NAV=[{id:'home',label:'Home',href:'#/'},{id:'about',label:'About',href:'#/about'},{id:'work',label:'Selected Work',href:'#/work'},{id:'archive',label:'Archive',href:'#/archive'},{id:'personal',label:'Personal Space',href:'#/personal'},{id:'contact',label:'Contact',href:'#/contact'}];
const miaComponent=document.querySelector('#mia-navigation');
const miaToggle=document.querySelector('#mia-toggle');
const miaLinks=document.querySelector('#mia-links');
let closeTimer,keyboardNavigation=true,hoverWithin=false,suppressFocusOpen=false;
document.querySelector('#nav').innerHTML=MIA_NAV.map(n=>`<a href="${n.href}">${n.label}</a>`).join('');
miaLinks.innerHTML=MIA_NAV.map(n=>`<a href="${n.href}"><img src="assets/${n.id}.svg" alt=""><span>${n.label}</span></a>`).join('');
function setMiaOpen(open){clearTimeout(closeTimer);miaLinks.hidden=!open;miaToggle.setAttribute('aria-expanded',String(open));miaToggle.setAttribute('aria-label',open?'Close Mia navigation':'Open Mia navigation');miaComponent.classList.toggle('expanded',open)}
function deferClose(){clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(!hoverWithin&&!(keyboardNavigation&&miaComponent.contains(document.activeElement)))setMiaOpen(false)},320)}
miaToggle.addEventListener('click',()=>setMiaOpen(miaLinks.hidden));
miaComponent.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hoverWithin=true;keyboardNavigation=false;setMiaOpen(true)}});
miaComponent.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hoverWithin=false;deferClose()}});
miaComponent.addEventListener('focusin',()=>{clearTimeout(closeTimer);if(keyboardNavigation&&!suppressFocusOpen)setMiaOpen(true)});
miaComponent.addEventListener('focusout',deferClose);
document.addEventListener('pointerdown',e=>{keyboardNavigation=false;if(!miaComponent.contains(e.target))setMiaOpen(false)},true);
document.addEventListener('keydown',e=>{if(['Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))keyboardNavigation=true;if(e.key==='Escape'&&!miaLinks.hidden){suppressFocusOpen=true;setMiaOpen(false);miaToggle.focus();queueMicrotask(()=>suppressFocusOpen=false)}if(e.key==='ArrowUp'&&e.target===miaToggle){e.preventDefault();setMiaOpen(true);miaLinks.querySelector('a').focus()}});
function updateMiaNavigation(page){setMiaOpen(false);miaComponent.hidden=page==='home';const current=page==='project'?'archive':page==='journal'?'personal':page;miaLinks.querySelectorAll('a').forEach(a=>{if(a.hash===(current==='home'?'#/':'#/'+current))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
// Approved resting-cheek photograph. No colour, sharpening, erosion, perspective,
// face reshaping, or direction-sheet substitution is applied to the character.
function miaFigureMarkup(){return `<span class="mia-rest" data-mode="approved-static-original"><img class="mia-rest-photo" src="assets/home-refinement/approved-rest.svg" alt="" draggable="false" decoding="async"></span>`;}
const oldMini=miaToggle.querySelector('img');const mini=document.createElement('span');mini.className='mia-mini';mini.setAttribute('aria-hidden','true');mini.innerHTML=miaFigureMarkup();oldMini.replaceWith(mini);
let disposeFollow=()=>{};
function stopFollowing(){disposeFollow();disposeFollow=()=>{};}
function layoutMiaArc(scene){
 const w=scene.clientWidth,h=scene.clientHeight,small=w<=600,medium=w<=1000;
 const width=small?66:medium?120:170;
 const radius=small?(w-width-24)/2:Math.min((w-width-48)/2,(h-210)/1.65);
 const cx=w/2,cy=radius+(small?215:160);
 scene.dataset.arcRadius=radius.toFixed(3);scene.dataset.arcCenter=`${cx},${cy}`;
 scene.querySelectorAll('.sticker').forEach((a,i)=>{const degrees=180-i*36,rad=degrees*Math.PI/180;a.style.setProperty('--anchor-x',`${cx+radius*Math.cos(rad)}px`);a.style.setProperty('--anchor-y',`${cy-radius*Math.sin(rad)}px`);a.dataset.angle=degrees;});
}
// Only portrait size/position and cloud composition are calibrated here.
// Navigation anchors, content and pointer-follow behaviour are unchanged.
const MIA_CLOUD_WIDTH=1584,MIA_CLOUD_HEIGHT=463;
const MIA_CLOUD_TOP=[20, 27, 41, 67, 77, 96, 108, 114, 126, 150, 165, 172, 185, 216, 219, 226, 238, 258, 272, 278, 288, 291, 293, 301, 300, 301, 305, 306, 305, 305, 306, 301, 300, 302, 296, 290, 290, 291, 281, 277, 275, 260, 247, 240, 238, 220, 203, 196, 193, 181, 167, 160, 158, 154, 138, 130, 128, 128, 126, 120];
function layoutMiaClouds(scene){
 const portrait=scene.querySelector('.hero-mia'),cloud=scene.querySelector('.cloud-main');if(!portrait||!cloud)return;
 const sr=scene.getBoundingClientRect(),small=sr.width<=600,medium=sr.width<=1000;
 const portraitWidth=Math.min(sr.width*(small?1.50:medium?1.18:.86),sr.height*1.12);
 const ps=portraitWidth/950,eyeAnchor=sr.height*(small?.69:medium?.63:.62);
 const portraitBottom=sr.height-eyeAnchor-265*ps;
 scene.style.setProperty('--composition-portrait-width',`${portraitWidth.toFixed(3)}px`);
 scene.style.setProperty('--composition-portrait-bottom',`${portraitBottom.toFixed(3)}px`);
 const pr=portrait.getBoundingClientRect(),cr=cloud.getBoundingClientRect(),cs=cr.width/MIA_CLOUD_WIDTH;if(!ps||!cs)return;
 const left=sr.left+sr.width/2-cr.width/2,binWidth=MIA_CLOUD_WIDTH/MIA_CLOUD_TOP.length;
 const x0=Math.max(0,Math.floor((pr.left+(620-265)*ps-left)/cs/binWidth));
 const x1=Math.min(MIA_CLOUD_TOP.length-1,Math.ceil((pr.left+(1000-265)*ps-left)/cs/binWidth));
 const top=Math.min(...MIA_CLOUD_TOP.slice(x0,x1+1));
 const unshiftedTop=sr.height-MIA_CLOUD_HEIGHT*cs+top*cs;
 const handClearance=pr.top-sr.top+(790-315)*ps+8;
 const drop=handClearance-unshiftedTop;
 scene.style.setProperty('--front-cloud-drop',`${drop.toFixed(3)}px`);
 scene.style.setProperty('--cloud-floor-height',`${Math.max(80,-drop+28).toFixed(3)}px`);
 scene.dataset.cloudDrop=drop.toFixed(3);scene.dataset.cloudClearance=handClearance.toFixed(3);
}
// Static restoration: original approved portrait. Responsive layout remains active.
// Previous pointer animation is preserved in backups/before-static-person-20261031/.
const MIA_FOLLOW_CONFIG=Object.freeze({tau:125,deadZone:.10,enter:.28,exit:.16,dwell:65,maxRoll:1.1,maxX:3,maxY:1.2});
function startFollowing(){
 const scene=document.querySelector('.sky');if(!scene)return;
 const photo=scene.querySelector('.mia-rest');if(!photo)return;
 photo.style.setProperty('--mia-follow','none');
 photo.dataset.mode='approved-static-original';photo.dataset.direction='center';
 photo.dataset.followX=photo.dataset.followY='0';photo.dataset.followState='static';
 // Preserve responsive composition, without pointer handlers or animation loops.
 const measure=()=>{layoutMiaArc(scene);layoutMiaClouds(scene);};
 const observer=new ResizeObserver(measure);observer.observe(scene);measure();
 disposeFollow=()=>{observer.disconnect();photo.style.removeProperty('--mia-follow');};
}
