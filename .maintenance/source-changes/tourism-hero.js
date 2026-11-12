/* Measure the original rotated cards after language and font layout. */
(() => {
 let queued=false;
 function layout(){
  queued=false;const art=document.querySelector('.hero-art'),first=art?.querySelector('.harbin-print'),last=art?.querySelector('.tianshui-print');if(!first||!last)return;
  art.style.transform='none';last.style.left='';
  const origin=art.getBoundingClientRect(),matrix=new DOMMatrix(getComputedStyle(last).transform),cx=last.offsetLeft+last.offsetWidth/2,cy=last.offsetTop+last.offsetHeight/2;
  const text=first.querySelector('p'),walker=document.createTreeWalker(text,NodeFilter.SHOW_TEXT);let n,shift=0;
  while(n=walker.nextNode())for(let i=0;i<n.length;i++)if(n.textContent[i].trim()){
   const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);const box=r.getBoundingClientRect(),y=(box.top+box.bottom)/2-origin.top;
   const leftEdge=cx-last.offsetWidth/(2*matrix.a)-(matrix.b/matrix.a)*(y-cy);
   if(y>last.offsetTop-25&&y<last.offsetTop+last.offsetHeight+25)shift=Math.max(shift,box.right-origin.left+8-leftEdge);
  }
  if(shift>0)last.style.left=(last.offsetLeft+Math.ceil(shift))+'px';
  const boxes=[first,last].map(e=>e.getBoundingClientRect()),left=Math.min(...boxes.map(r=>r.left-origin.left)),right=Math.max(...boxes.map(r=>r.right-origin.left)),bottom=Math.max(...boxes.map(r=>r.bottom-origin.top));
  const available=Math.min(art.clientWidth,document.documentElement.clientWidth-origin.left-12),scale=Math.min(1,(available-12)/(right-left));
  const caption=art.querySelector('.art-caption');if(caption){caption.style.top=(bottom+18)+'px';caption.style.bottom='auto'}
  art.style.transformOrigin='top left';art.style.transform=`translateX(${-left*scale+6}px) scale(${scale})`;art.style.height=Math.ceil((bottom+18+(caption?.offsetHeight||0))*scale+20)+'px';art.dataset.cardScale=scale.toFixed(4);
 }
 function schedule(){if(queued)return;queued=true;document.fonts.ready.then(()=>requestAnimationFrame(layout))}
 window.MIA_TOURISM_HERO={layout:schedule};addEventListener('resize',schedule);addEventListener('mia-language-ready',schedule);document.fonts.addEventListener('loadingdone',schedule);schedule();
})();
