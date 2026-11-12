/* Full, language-specific reading editions. Never fall back from English to Chinese. */
(async()=>{'use strict';
const script=document.currentScript,base=new URL('.',script?.src||location.href);const id=document.body.dataset.workId||new URLSearchParams(location.search).get('id');
const original=new URLSearchParams(location.search).has('original');const language=original?'zh':window.MIA_LANGUAGE||'en';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const main=document.querySelector('main');
try{
 const work=await window.MIA_FETCH_WORK(id,base);
 const edition=work[language];if(!edition?.html)throw Error(language==='en'?'The full English edition is not yet available.':'对应全文尚未完成。');
 document.documentElement.lang=language==='zh'?'zh-CN':'en';document.title=edition.title+' / MIA';document.body.classList.add('work-page');
 const back=language==='zh'?'← 返回作品档案':'← Back to Archive';const originals=language==='zh'?'原始材料':'Original material';
 main.className='work-shell';main.setAttribute('data-no-translate','');main.innerHTML=`<nav class="work-nav"><a href="${new URL('index.html#/archive',base)}">${back}</a><span class="work-kind">${escape(edition.category||'')}</span></nav><header class="work-header"><h1>${escape(edition.title)}</h1>${edition.contribution?`<p class="work-contribution">${escape(edition.contribution)}</p>`:''}</header><article class="work-body" lang="${language==='zh'?'zh-CN':'en'}">${edition.html}</article><section class="work-originals"><h2>${originals}</h2>${language==='en'&&work.zh&&work.originalLanguage!=='en'?`<a href="?${id?'id='+encodeURIComponent(id)+'&':''}original=1" target="_blank" rel="noopener" lang="en">Read original in Chinese ↗</a>`:''}${(work.attachments||[]).map(a=>`<a href="${new URL(a.href,base)}" target="_blank" rel="noopener">${escape(a[language]||a.en)}</a>`).join('')}</section>`;
 for(const table of main.querySelectorAll('table'))if(!table.closest('.responsive-table,.source-table')){const wrapper=document.createElement('div');wrapper.className='responsive-table';table.before(wrapper);wrapper.append(table)}
 if(id==='haidilao'){
  const film=document.createElement('section');film.id='film';
  film.innerHTML=`<h2>${language==='zh'?'课程视频':'Course video'}</h2><video controls playsinline preload="none" src="${new URL('source-media/web/haidilao.mp4',base)}"></video>`;
  main.querySelector('.work-body').prepend(film);
 }
 main.querySelectorAll('video').forEach(v=>{v.controls=true;v.playsInline=true;v.preload='none'});
 main.addEventListener('click',event=>{const link=event.target.closest('[data-video-seek]');if(!link)return;event.preventDefault();const video=main.querySelector('video');if(video){video.currentTime=Number(link.dataset.videoSeek);video.scrollIntoView({block:'center',behavior:'smooth'})}});
 window.MIA_WORK_READY={id,language,paragraphs:main.querySelectorAll('.work-body p').length,characters:main.querySelector('.work-body').textContent.length,complete:!!edition.complete};
}catch(error){main.className='work-shell';main.innerHTML='<p class="work-error" role="alert">'+escape(error.message)+'</p>';window.MIA_WORK_ERROR=error.message;}
})();
