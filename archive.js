(()=>{'use strict';
const base=new URL(document.currentScript?.dataset.previewBase||'.',document.currentScript?.src||location.href);
const categories=[
{id:'research',name:'Research Papers',copy:'Questions about digital life, culture, intimacy and privacy. Papers, theses and presentations collected along the way.'},
{id:'planning',name:'Content Planning',copy:'An idea becomes a plan: audiences, cultural connections, channels and the details that make a campaign happen.'},
{id:'multimedia',name:'Multimedia',copy:'Stories made through photographs, moving images and visual sequences.'},
{id:'data',name:'Data Analysis',copy:'Patterns worth looking at twice. Interactive stories that connect data, visual choices and the people behind the numbers.'},
{id:'writing',name:'Writing',copy:'Observations, reflections and essays. A place for a thought to find its own shape.'},
{id:'journalism',name:'Journalism',copy:'Reported stories about real lives. Listening closely, noticing the everyday, and finding the story within it.'}];
const projects=[
{id:'zine',category:'multimedia',title:'Zine! Zine! Zine! — Ideas in Motion',description:'Local television report supplied as a complete video.',meta:'Local television report · Supplied video',medium:'Video',year:'2022',language:'Chinese 中文',keywords:'Zine 流动的思想 浙闻速递',file:'Zine_Ideas_in_Motion.html'},
{id:'piaopiao',category:'journalism',title:'A Girl Called Piaopiao',description:'A narrative reporting draft about leaving home and beginning again.',meta:'Huimin Wu · Narrative reporting draft',medium:'Reported feature',year:'',language:'English Chinese 中文',keywords:'飘飘',file:'A_Girl_Called_Piaopiao.html'},
{id:'screenshot',category:'research',title:'Someone Took a Screenshot',description:'Screenshot notifications, privacy risk and social behaviour.',meta:'BA thesis · Zhejiang University · 2025',medium:'Research paper',year:'2025',language:'English Chinese 中文',keywords:'截图通知 隐私',file:'Someone_Took_a_Screenshot.html'},
{id:'romance',category:'research',title:'Beyond Scripted Romance',description:'Otome-game players, AI platforms and the reconstruction of intimacy.',meta:'MA thesis · KU Leuven · 14 interviews',medium:'Research paper',year:'',language:'English',keywords:'乙女游戏 人工智能 intimacy digital relationships',file:'Beyond_Scripted_Romance.html'},
{id:'campaign',category:'planning',title:'Read Together',description:'A cultural exchange campaign built around reading and shared experiences.',meta:'China Bookshelf · Campaign proposal',medium:'Campaign proposal',year:'',language:'English Chinese 中文',keywords:'策划 阅读 cultural exchange',file:'Read_Together_Campaign_Proposal.html'},
{id:'oscars',category:'data',title:'Who Gets Nominated?',description:'Race, gender and recognition across 30 years of Oscar nominations.',meta:'1994–2024 dataset · Interactive data story',medium:'Interactive data story',year:'',language:'English',keywords:'奥斯卡 提名 diversity race gender cinema movies',file:'Who_Gets_Nominated.html'},
{id:'tourism',category:'data',title:'When a City Goes Viral',description:'Harbin, Tianshui, online attention and tourism recovery.',meta:'Two-city study · Tourism · Bilingual editions',medium:'Interactive data story',year:'',language:'Chinese 中文',keywords:'哈尔滨 天水 旅游 复苏',file:'When_a_City_Goes_Viral.html'},
{id:'journalism',category:'journalism',title:'A Small Victory of Her Own',description:'A village dance troupe and a woman’s everyday agency.',meta:'Reported feature · EN / 中文',medium:'Reported feature',year:'',language:'English Chinese 中文',keywords:'一个中年妇女的小小精神胜利 陈兰 dance women',file:'A_Small_Victory_of_Her_Own.html'}];
// New full-text editions replace their matching legacy summary, rather than
// counting the same work twice. All other known projects and essays stay visible.
const sourceEditions={"bollywood":"source-bollywood.html","haidilao":"source-haidilao.html","budgets":"source-budgets.html","governance":"source-governance.html","copyright":"source-copyright.html","rumours":"source-rumours.html","self-method":"source-self-method.html",'piaopiao':'A_Girl_Called_Piaopiao.html','silence-report':'Breaking_the_Trap.html'};
Object.assign(sourceEditions,{"barbie": "reading-barbie.html", "ceremonie": "reading-ceremonie.html", "ferrante": "reading-ferrante.html", "furry": "reading-furry.html", "gaokao": "reading-gaokao.html", "imitation": "reading-imitation.html", "ivory-tower": "reading-ivory-tower.html", "road": "reading-road.html", "tomatoes": "reading-tomatoes.html"});
const aliases={barber:'barber',romance:'romance',privacy:'screenshot',representation:'oscars',bookcase:'campaign',dance:'journalism'};
const categoryIds=Object.fromEntries(categories.map(c=>[c.name,c.id]));
for(const p of catalog()){
  if(aliases[p.id])continue;
  projects.push({id:'legacy-'+p.id,category:categoryIds[p.category],title:p.title,
    description:p.intro,meta:[p.medium,p.year||'Year unconfirmed',p.language,...(!sourceEditions[p.id]?['Source needed']:[])].join(' · '),
    medium:p.medium,year:p.year?String(p.year):'',language:p.language,
    keywords:[p.source,p.original].filter(Boolean).join(' '),file:sourceEditions[p.id],href:sourceEditions[p.id]?undefined:p.href});
}
// Additional verified full works.
projects.push(...[{"id": "public-figures", "category": "research", "title": "Public Figures’ Rights and the Boundaries of News Reporting", "description": "", "meta": "Research paper", "medium": "Research paper", "year": "", "language": "English Chinese 中文", "keywords": "公众人物权利与新闻报道的边界", "file": "reading-public-figures.html"}, {"id": "photography", "category": "multimedia", "title": "News Photography: Experiments and Stories", "description": "", "meta": "Photo essay", "medium": "Photo essay", "year": "", "language": "English Chinese 中文", "keywords": "新闻摄影实验册", "file": "reading-photography.html"}, {"id": "ai-society", "category": "research", "title": "Private Domain Reconstruction — AI Society Paper", "description": "", "meta": "Research paper", "medium": "Research paper", "year": "", "language": "English Chinese 中文", "keywords": "私域重构——AI Society课程论文", "file": "reading-ai-society.html"}, {"id": "social-marketing", "category": "research", "title": "Pinduoduo Social Marketing: Emotional Experience and Purchasing Behaviour", "description": "", "meta": "Research paper", "medium": "Research paper", "year": "", "language": "English Chinese 中文", "keywords": "拼多多社会化营销策略对大学生用户情感体验和购买行为的影响研究", "file": "reading-social-marketing.html"}, {"id": "digital-news", "category": "research", "title": "Deconstructing and Rebuilding Journalistic Discursive Authority", "description": "", "meta": "Research paper", "medium": "Research paper", "year": "", "language": "English Chinese 中文", "keywords": "数字新闻时代新闻话语权威的解构与重塑", "file": "reading-digital-news.html"}, {"id": "ai-short-videos", "category": "research", "title": "AI Short Videos — A Study of Douyin", "description": "", "meta": "Research paper", "medium": "Research paper", "year": "", "language": "English Chinese 中文", "keywords": "AI短视频——以抖音平台为例", "file": "reading-ai-short-videos.html"}, {"id": "commentaries", "category": "writing", "title": "Four News Commentaries: Truth, Emotion and Care", "description": "", "meta": "Essay", "medium": "Essay", "year": "", "language": "English Chinese 中文", "keywords": "新闻评论四篇：真实、情绪与关怀", "file": "reading-commentaries.html"}, {"id": "barber", "category": "multimedia", "title": "Time and the Barber’s Craft — Sandun Barbershop", "description": "", "meta": "Video", "medium": "Video", "year": "", "language": "English Chinese 中文", "keywords": "岁月留锋——三墩理发店", "file": "reading-barber.html"}, {"id": "broadcast", "category": "multimedia", "title": "The Daqian Interview: Reality Television, Editing and Audiences", "description": "", "meta": "Video", "medium": "Video", "year": "", "language": "English Chinese 中文", "keywords": "大千专访：真人秀、剪辑与观众", "file": "reading-broadcast.html"}]);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const urls=new Map();function projectURL(p){if(p.href)return new URL(p.href,base).href;if(window.MIA_ARCHIVE_BUNDLE?.projects?.[p.file]){if(!urls.has(p.file))urls.set(p.file,URL.createObjectURL(new Blob([window.MIA_ARCHIVE_BUNDLE.projects[p.file]],{type:'text/html'})));return urls.get(p.file)}return new URL('projects/'+p.file,base).href}
let stopArchiveFlight=()=>{};
function openWork(p){const form=document.querySelector('.ar-searchbar');try{sessionStorage.setItem('mia-archive-return',JSON.stringify({href:location.href,y:scrollY,filters:form?Object.fromEntries(new FormData(form)):{}}))}catch{}const destination=new URL(projectURL(p),location.href);destination.searchParams.set('from','archive');location.assign(destination.href)}
function mount(main){if(main.querySelector('[data-mia-archive]'))return;
stopArchiveFlight();
main.innerHTML=`<section class="mia-archive mia-archive-depth" data-mia-archive aria-labelledby="ar-title"><header class="ar-heading"><div><p class="ar-eyebrow">Mia / Collected along the way</p><h1 id="ar-title">The <em>Archive.</em></h1></div><p class="ar-heading-copy">Open a drawer. Follow a curiosity.<br>There’s always another thread to pull.</p></header><form class="ar-searchbar" role="search" aria-label="Search the archive"><label class="ar-search-label">Search<input type="search" name="search" placeholder="Title, topic, original title, or language" autocomplete="off"></label><label>Work category<select name="category"><option value="all">All</option>${categories.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></label><label>Medium<select name="medium"><option value="all">All</option>${[...new Set(projects.map(p=>p.medium))].map(m=>`<option>${m}</option>`).join('')}</select></label><label>Year<select name="year"><option value="all">All</option>${[...new Set(projects.map(p=>p.year).filter(Boolean))].sort().reverse().map(y=>`<option value="${y}">${y}</option>`).join('')}<option value="undated">Unspecified</option></select></label><button type="reset" class="ar-clear">Clear filters ↺</button></form><div class="ar-layout"><div class="ar-cabinet-wrap"><div class="ar-cabinet" role="group" aria-label="Six archive drawers">${categories.map(c=>`<div class="ar-drawer-slot"><div class="ar-tray" aria-hidden="true"><div class="ar-tray-books"></div></div><button type="button" class="ar-drawer" data-category="${c.id}" aria-expanded="false" aria-controls="ar-contents"><span class="ar-label">${c.name}</span><span class="ar-handle" aria-hidden="true"></span><span class="ar-drawer-count" aria-hidden="true">${projects.filter(p=>p.category===c.id).length}</span></button></div>`).join('')}</div><div class="ar-cabinet-feet" aria-hidden="true"></div><p class="ar-cabinet-caption">A few things worth keeping.</p></div><section class="ar-index" id="ar-contents" aria-labelledby="ar-section-title"><div class="ar-index-meta"><span class="ar-location">All drawers</span><span class="ar-status" role="status" aria-live="polite"></span></div><h2 id="ar-section-title">A little of everything.</h2><p class="ar-category-copy">Research, plans, patterns and stories. Browse the folders, or open a drawer to look a little closer.</p><div class="ar-folder-list"></div><p class="ar-note"><span aria-hidden="true">↳</span> An archive that grows with me.</p></section></div></section>`;
const root=main.querySelector('[data-mia-archive]'),form=root.querySelector('form'),search=form.elements.search,category=form.elements.category,medium=form.elements.medium,year=form.elements.year,list=root.querySelector('.ar-folder-list');
const requested=decodeURIComponent(location.hash.split('/')[2]||'');category.value=categoryIds[requested]||'all';
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let flight, flightLayer;
function cancelFlight(completed=false){
 flight?.kill();
 flight=undefined;
 flightLayer?.remove();
 flightLayer=undefined;
 if(completed!==true)root.querySelectorAll('.ar-tray-book').forEach(spine=>spine.classList.remove('has-flown'));
 list.querySelectorAll('.is-in-flight').forEach(book=>book.classList.remove('is-in-flight'));
 window.removeEventListener('resize',cancelFlight);
 reduceMotion.removeEventListener('change',cancelFlight);
}
stopArchiveFlight=cancelFlight;
function flyBooks(slot, onLanded){
 const gsap=window.gsap;
 const covers=[...list.querySelectorAll('.ar-book')];
 if(!gsap||reduceMotion.matches||!covers.length)return false;
 const spines=[...slot.querySelectorAll('.ar-tray-book')];
 // Hide the destination covers while the drawer opens. Measure once the tray has settled.
 covers.forEach(cover=>cover.classList.add('is-in-flight'));
 window.addEventListener('resize',cancelFlight,{once:true});
 reduceMotion.addEventListener('change',cancelFlight,{once:true});
 flight=gsap.delayedCall(.34,()=>{
  const pageX=scrollX,pageY=scrollY;
  const positions=covers.map((cover,index)=>({
   start:spines[index].getBoundingClientRect(),
   end:cover.getBoundingClientRect()
  }));
  flightLayer=document.createElement('div');
  flightLayer.className='ar-flight-layer';
  flightLayer.setAttribute('aria-hidden','true');
  const fragment=document.createDocumentFragment();
  const copies=covers.map((cover,index)=>{
   const {end}=positions[index];
   const copy=cover.cloneNode(true);
   copy.removeAttribute('href');
   copy.removeAttribute('data-project');
   copy.classList.replace('is-in-flight','ar-flight-book');
   Object.assign(copy.style,{left:end.left+pageX+'px',top:end.top+pageY+'px',width:end.width+'px',height:end.height+'px'});
   fragment.append(copy);
   return copy;
  });
  flightLayer.append(fragment);
  document.body.append(flightLayer);
  flight=gsap.timeline({onComplete:()=>{
   cancelFlight(true);
   onLanded?.();
  }});
  copies.forEach((copy,index)=>{
   const {start,end}=positions[index];
   const dx=start.left+start.width/2-end.left-end.width/2;
   const dy=start.top+start.height/2-end.top-end.height/2;
   const lift=Math.min(100,55+Math.abs(dx)*.1);
   const offset=index*Math.min(.082,.58/Math.max(1,covers.length-1));
   const path={progress:0};
   function place(t){
    const remaining=1-t;
    const x=dx*remaining;
    const y=dy*remaining-4*lift*t*remaining;
    const rotation=-17*remaining+22*t*remaining;
    // Finish opening the book to full size just before the handoff.
    const growth=Math.min(1,t/.96);
    const scale=.24+.76*growth*growth*(3-2*growth);
    copy.style.transform=`translate3d(${x}px,${y}px,0) rotate(${rotation}deg) scale(${scale})`;
   }
   place(0);
   copy.style.opacity='0';
   flight.to(path,{progress:1,duration:.83,ease:'sine.inOut',
    onStart:()=>{
     spines[index].classList.add('has-flown');
     copy.style.opacity='1';
    },
    onUpdate:()=>place(path.progress),
    onComplete:()=>{
     covers[index].classList.remove('is-in-flight');
     copy.remove();
    }
   },offset);
  });
 });
 return true;
}
function render(animate=false,onLanded){
 cancelFlight();
 const cat=categories.find(c=>c.id===category.value),q=search.value.trim().toLocaleLowerCase();let items=projects.filter(p=>(!cat||p.category===cat.id)&&(medium.value==='all'||p.medium===medium.value)&&(year.value==='all'||(year.value==='undated'?!p.year:p.year===year.value))&&(!q||[p.title,p.description,p.meta,p.medium,p.language,p.keywords,categories.find(c=>c.id===p.category).name,...[p.title,p.description,p.meta,p.medium].map(t=>window.MIA_I18N?.translate(t)||t)].join(' ').toLocaleLowerCase().includes(q)));let openSlot;
 root.querySelectorAll('.ar-drawer').forEach(button=>{
  const open=button.dataset.category===category.value;
  button.setAttribute('aria-expanded',String(open));
  const slot=button.closest('.ar-drawer-slot');
  slot.classList.toggle('is-open',open);
  slot.querySelector('.ar-tray-books').innerHTML=open?items.map(p=>`<span class="ar-tray-book" data-book-category="${p.category}"></span>`).join(''):'';
  if(open)openSlot=slot;
 });root.querySelector('.ar-location').textContent=cat?cat.name:'All drawers';root.querySelector('.ar-status').textContent=`${items.length} ${items.length===1?'folder':'folders'}`;root.querySelector('#ar-section-title').textContent=cat?cat.name:'A little of everything.';root.querySelector('.ar-category-copy').textContent=cat?cat.copy:'Research, plans, patterns and stories. Browse the folders, or open a drawer to look a little closer.';
list.innerHTML=items.length?items.map(p=>`<a class="ar-book" data-book-category="${p.category}" href="${projectURL(p)}" data-project="${p.id}" aria-label="Open ${escape(p.title)}"><span class="ar-book-category">${categories.find(c=>c.id===p.category).name}</span><span class="ar-book-title">${escape(p.title)}</span><span class="ar-book-meta">${escape(p.meta)}</span><span class="ar-book-arrow" aria-hidden="true">↗</span></a>`).join(''):`<div class="ar-empty"><strong>${cat&&!projects.some(p=>p.category===cat.id)?'Room for the next story.':'No folders found.'}</strong><p>${cat&&!projects.some(p=>p.category===cat.id)?'This drawer is here for future work. For now, explore another drawer.':'Try another keyword or clear the filters to explore the archive.'}</p></div>`;if(!(animate&&openSlot&&flyBooks(openSlot,onLanded)))onLanded?.();
}
form.addEventListener('submit',e=>e.preventDefault());search.addEventListener('input',()=>render());form.addEventListener('change',e=>{if(e.target!==search)render()});form.addEventListener('reset',event=>{
 event.preventDefault();
 search.value='';
 category.value=medium.value=year.value='all';
 render();
});root.addEventListener('click',e=>{const drawer=e.target.closest('.ar-drawer');if(drawer){category.value=category.value===drawer.dataset.category?'all':drawer.dataset.category;
 const showShelf=category.value!=='all'&&matchMedia('(max-width:760px)').matches
  ?()=>root.querySelector('.ar-index').scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth',block:'start'})
  :undefined;
 render(true,showShelf);
 }const link=e.target.closest('[data-project]');if(link&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey&&e.button===0){if(document.body.hasAttribute('data-mia-archive-demo'))return;
 e.preventDefault();const p=projects.find(p=>p.id===link.dataset.project);openWork(p)}});try{const saved=JSON.parse(sessionStorage.getItem('mia-archive-return')||'null');if(saved&&new URL(saved.href).hash===location.hash){for(const [key,value] of Object.entries(saved.filters||{})){if(form.elements[key])form.elements[key].value=value}const restore=()=>requestAnimationFrame(()=>scrollTo(0,saved.y));if(document.readyState==='complete')restore();else addEventListener('load',restore,{once:true})}}catch{}render();}
function check(){const main=document.querySelector('main#main');if(!main)return;const hash=location.hash.split('?')[0].replace(/\/$/,'');if(document.body.hasAttribute('data-mia-archive-demo')||(hash==='#/archive'||hash.startsWith('#/archive/')))mount(main);else stopArchiveFlight()}
function start(){check();const main=document.querySelector('main#main');window.addEventListener('hashchange',check)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();window.MIA_PAGE_RENDERERS=window.MIA_PAGE_RENDERERS||{};window.MIA_PAGE_RENDERERS['archive']=mount;
})();
