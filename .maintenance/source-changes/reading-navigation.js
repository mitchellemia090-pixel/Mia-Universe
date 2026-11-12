(()=>{'use strict';
 // Legacy layouts have many local 9–13px rules. Raise only undersized reading
 // controls/auxiliary text, leaving headings, artwork and chart geometry intact.
 let typeQueued=false;const chartFonts=new WeakMap();
 function readableType(){typeQueued=false;for(const e of document.querySelectorAll('p,li,figcaption,nav a,aside a,button,label,summary,small,span')){
  if((e.children.length&&e.matches('span,small'))||!e.textContent.trim()||e.closest('svg,h1,h2,h3,h4,h5,h6,script,style,[aria-hidden="true"]')||e.classList.contains('reading-aux-type')||e.classList.contains('reading-control-type'))continue;
  const control=e.matches('a,button,label,summary');if(parseFloat(getComputedStyle(e).fontSize)<(control?16:14))e.classList.add(control?'reading-control-type':'reading-aux-type');
 }
 for(const svg of document.querySelectorAll('svg.diagram'))if(!svg.closest('.reading-diagram-scroll')){const wrap=document.createElement('div');wrap.className='reading-diagram-scroll';svg.before(wrap);wrap.append(svg)}
 for(const text of document.querySelectorAll('svg text')){const matrix=text.getScreenCTM();if(!matrix)continue;const scale=Math.hypot(matrix.a,matrix.b);if(!scale)continue;const base=chartFonts.get(text)||parseFloat(getComputedStyle(text).fontSize);chartFonts.set(text,base);const size=Math.max(base,14/scale);if(Math.abs((parseFloat(text.style.fontSize)||base)-size)>.05)text.style.fontSize=size.toFixed(2)+'px'}
 }
 function queueType(){if(!typeQueued){typeQueued=true;requestAnimationFrame(readableType)}}
 new MutationObserver(queueType).observe(document.body,{childList:true,subtree:true});addEventListener('resize',queueType);readableType();
 const from=new URLSearchParams(location.search).get('from');if(!['selected-work','archive'].includes(from))return;
 const language=window.MIA_LANGUAGE||'en',bar=document.createElement('nav');bar.className='reading-return';bar.dataset.noTranslate='';
 const archive=from==='archive',link=document.createElement('a');link.textContent=language==='zh'?(archive?'← 返回作品档案':'← 返回精选作品'):(archive?'← Archive':'← Selected Work');
 let destination=new URL('../index.html#/'+(archive?'archive':'work'),location.href).href;
 try{const saved=JSON.parse(sessionStorage.getItem(archive?'mia-archive-return':'mia-work-return')||'null');if(saved){const url=new URL(saved.href);if(url.origin===location.origin&&(archive?url.hash.startsWith('#/archive'):['#/work','#/selected-work'].includes(url.hash))){url.searchParams.delete('work');destination=url.href}}}catch{}
 link.href=destination;bar.append(link);document.body.prepend(bar);
})();
