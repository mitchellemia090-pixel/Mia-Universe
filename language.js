/* Local, offline language preference shared by routes and same-origin readers. */
(()=>{'use strict';
const originalView=new URLSearchParams(location.search).has('original');
let lang=originalView?'zh':window.MIA_LANGUAGE||'en';
window.MIA_LANGUAGE=lang;
const normalize=s=>s.replace(/\s+/g,' ').trim();
const dict=window.MIA_TRANSLATIONS||{};
const originals=new WeakMap();
function translate(s){const key=normalize(s);if(!key)return s;const pair=dict[key];let out=pair?(lang==='zh'?pair[1]:pair[0]):key;
 if(!pair&&key.endsWith(' / Personal Universe')){const label=key.slice(0,-20);out=(dict[label]?.[lang==='zh'?1:0]||label)+' / '+(lang==='zh'?'个人宇宙':'Personal Universe');}
 if(!pair&&lang==='zh')out=out.replace(/^Play with (.+)$/,(_,name)=>'与'+(dict[name]?.[1]||name)+'体验故事');
 if(!pair&&/ official artwork$| — official Love and Deepspace artwork$/.test(key))out=key.replace(/^(.+) \/ ([\u4e00-\u9fff]+)(?: — official Love and Deepspace artwork| official artwork)$/,(_,en,zh)=>lang==='en'?en+' · Official character artwork':zh+' · 官方角色美术');
 if(lang==='zh'&&!pair){
  for(const [pattern,repl] of [[/^(\d+) folders?$/,'$1 份作品'],[/^(\d+) selected projects$/,'$1 个精选项目'],[/^Open (.+)$/,'打开：$1'],[/^Bring forward: (.+)$/,'置于前方：$1']])if(pattern.test(out)){out=out.replace(pattern,repl);break}
  if(out===key&&key.includes(' · '))out=key.split(' · ').map(t=>dict[t]?.[1]||t).join(' · ');
  if(out===key&&key.startsWith('← '))out='← '+(dict[key.slice(2)]?.[1]||key.slice(2));
  out=out.replace(/^Main thesis pp\. (.+)$/,'论文正文第 $1 页').replace(/^Analysis · Thesis pp\. (.+)$/,'分析 · 论文第 $1 页').replace(/^分析 · Thesis pp\. (.+)$/,'分析 · 论文第 $1 页').replace(/^(U\d+) · Participant$/,'$1 · 参与者').replace(/^Thesis p\. (\d+) · (.+)$/,'论文第 $1 页 · $2').replace(/^(U\d+) · Thesis p\. (\d+)$/,'$1 · 论文第 $2 页').replace(/^(\d[\d,]*) records · showing (.+)$/,'$1 条记录 · 当前 $2').replace(/^White: (.+) · BIPOC: (.+)$/,'白人：$1 · 有色人种：$2').replace(/^All categories · years (.+)$/,'全部类别 · 年份 $1').replace(/^All categories · (.+) · share of annual nomination records$/,'全部类别 · $1 · 年度提名记录占比');
  out=out.replace(/^After the rain \/ (\d+) of 3$/,'雨后 / $1，共 3 节').replace(/^After the rain \/ Your ending$/,'雨后 / 你的结局').replace(/^An ending with (.+)$/,(_,name)=>'与'+(dict[name]?.[1]||name)+'的结局').replace(/^You chose: (.+)$/,(_,choice)=>'你的选择：'+(dict[choice]?.[1]||choice));
 }
 if(lang==='en'&&!pair){out=out.replace(/^找到 ([\d,]+) 条评论 · 当前 (.+)$/,'$1 comments · showing $2').replace(/^(哈尔滨|天水) \/ (\w+)$/,(_,city,id)=>(city==='哈尔滨'?'Harbin':'Tianshui')+' / '+id);
 out=out.replace(/^(哈尔滨|天水) · (.+)：([\d,]+) 条评论 \/ ([\d,]+) 条，占 ([\d.]+)%(；点击查看评论)?$/,(_,city,word,count,total,rate,action)=>(city==='哈尔滨'?'Harbin':'Tianshui')+' · '+(dict[word]?.[0]||word)+': '+count+' of '+total+' comments ('+rate+'%)'+(action?' · Select to read comments':''));
 out=out.replace(/^未命中任何主题的评论：哈尔滨 ([\d,]+) \/ ([\d,]+)，天水 ([\d,]+) \/ ([\d,]+)。$/,'Comments matching no topic: Harbin $1 / $2; Tianshui $3 / $4.');
 out=out.replace(/^(哈尔滨|天水)同比增长([\d.]+)%，共同尺度0到40%$/,(_,city,growth)=>(city==='哈尔滨'?'Harbin':'Tianshui')+' year-on-year growth '+growth+'%, shared scale 0–40%');
 if(out===key&&key.includes(' · '))out=key.split(' · ').map(t=>dict[t]?.[0]||t).join(' · ');
 }
 return s.slice(0,s.indexOf(s.trim()))+out+s.slice(s.indexOf(s.trim())+s.trim().length);
}
function textNode(n){if(n.parentElement?.closest('script,style,noscript,[data-no-translate],.mia-language,input,textarea,code,pre'))return;
 const old=originals.get(n);if(!old||n.nodeValue!==old.output)originals.set(n,{source:n.nodeValue,output:n.nodeValue});
 const state=originals.get(n),out=translate(state.source);if(out!==n.nodeValue)n.nodeValue=out;state.output=out;
}
let observer,queued=false;
function apply(){queued=false;observer?.disconnect();
 document.documentElement.lang=lang==='zh'?'zh-CN':'en';
 document.title=translate(document.title);
 for(const table of document.querySelectorAll('table')){if(!table.closest('.responsive-table,.source-table,.table-wrap')){const wrap=document.createElement('div');wrap.className='responsive-table';table.before(wrap);wrap.append(table)}}
 for(const option of document.querySelectorAll('option:not([value])'))option.setAttribute('value',option.textContent);
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())textNode(n);
 for(const el of document.querySelectorAll('[aria-label],[alt],[placeholder],[title]')){if(el.closest('[data-no-translate],.mia-language'))continue;for(const a of ['aria-label','alt','placeholder','title']){const s=el.getAttribute(a);if(s){const value=translate(s);if(value!==s)el.setAttribute(a,value)}}}
 // Every main navigation includes a keyboard and touch accessible language choice.
 const nav=document.querySelector('#mia-links');if(nav&&!nav.querySelector('.mia-language'))nav.append(controls());
 const sky=document.querySelector('.sky');if(sky&&!sky.querySelector('.mia-language')){const c=controls();c.classList.add('home-language');sky.append(c)}
 document.querySelectorAll('.mia-language button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===lang)));
 observer?.observe(document.body,{childList:true,subtree:true,characterData:true});
}
function controls(){const d=document.createElement('div');d.className='mia-language';d.setAttribute('role','group');d.setAttribute('aria-label',lang==='zh'?'网站语言':'Website language');d.innerHTML='<button type="button" data-language="en" lang="en">English</button><button type="button" data-language="zh" lang="zh-CN">中文</button>';return d}
function setLanguage(value){if(!['en','zh'].includes(value)||value===lang)return;try{localStorage.setItem('mia-language',value)}catch{}window.MIA_LANGUAGE=value;location.reload()}
window.MIA_I18N={apply,translate,setLanguage,get language(){return lang}};
function languageClick(e){const button=e.target.closest('.mia-language [data-language]');if(button){e.preventDefault();setLanguage(button.dataset.language)}}document.addEventListener('click',languageClick);
function start(){if(location.pathname.includes('/projects/')&&!originalView){const d=controls();d.classList.add('mia-project-language');document.body.prepend(d)}observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(apply)}});apply();
 dispatchEvent(new Event('mia-language-ready'));
 document.addEventListener('invalid',e=>{const input=e.target;if(!input.validity)return;input.setCustomValidity(input.validity.valueMissing?(lang==='zh'?'请填写此项。':'Please complete this field.'):input.validity.typeMismatch?(lang==='zh'?'请输入有效的电子邮箱地址。':'Please enter a valid email address.'):input.validity.tooShort?(lang==='zh'?'请输入更详细的内容。':'Please provide a little more detail.'):'')},true);
 document.addEventListener('input',e=>e.target.setCustomValidity?.(''));
}
addEventListener('storage',e=>{if(e.key==='mia-language'&&e.newValue!==lang&&!originalView)location.reload()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
