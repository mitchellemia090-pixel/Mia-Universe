(async()=>{'use strict';
const script=document.currentScript,base=new URL('.',script.src),id=script.dataset.workId;
const language=window.MIA_LANGUAGE||'en',section=document.createElement('section');section.className='wrap full-manuscript';section.dataset.noTranslate='';section.id='complete-manuscript';
const main=document.querySelector('main')||document.body;main.append(section);
try{
 const work=await window.MIA_FETCH_WORK(id,base),edition=work[language];if(!edition?.html)throw Error('Missing full manuscript');
 const title=language==='en'?'Complete manuscript':'作品全文';
 section.innerHTML=`<header class="full-manuscript-header"><h2>${title}</h2><a href="${new URL('projects/reading-'+id+'.html',base)}">${language==='en'?'Open reading page ↗':'打开完整阅读页 ↗'}</a></header><article class="work-body" lang="${language==='en'?'en':'zh-CN'}">${edition.html}</article><div class="work-originals">${language==='en'&&work.originalLanguage!=='en'?`<a href="${new URL('projects/reading-'+id+'.html?original=1',base)}" target="_blank" rel="noopener">Read original in Chinese ↗</a>`:''}${work.attachments.map(a=>`<a href="${new URL(a.href,base)}" target="_blank" rel="noopener">${a[language]}</a>`).join('')}</div>`;
 for(const table of section.querySelectorAll('table'))if(!table.closest('.responsive-table')){const wrap=document.createElement('div');wrap.className='responsive-table';table.before(wrap);wrap.append(table)}
 const headings=[...section.querySelectorAll('.work-body h2')].filter(h=>h.textContent.length<150);const toc=document.createElement('details');toc.className='manuscript-toc';toc.innerHTML='<summary>'+(language==='en'?'Contents':'目录')+'</summary><nav></nav>';headings.forEach((h,i)=>{h.id='full-'+id+'-'+i;const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;toc.querySelector('nav').append(a)});section.querySelector('.work-body').before(toc);
 window.MIA_FULL_MANUSCRIPT={id,language,complete:edition.complete,characters:section.querySelector('article').textContent.length};
}catch(error){section.textContent=language==='en'?'The complete manuscript could not be loaded.':'作品全文加载失败。';window.MIA_FULL_MANUSCRIPT_ERROR=error.message}
})();
