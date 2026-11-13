(() => {
'use strict';
const D=JSON.parse(document.getElementById('reportData').textContent);
const T=window.MIA_TOURISM,L=T.choose,tr=T.word;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(v,n=2)=>Number(v).toLocaleString('en-US',{maximumFractionDigits:n,minimumFractionDigits:n});
const num=v=>Number(v).toLocaleString('en-US');
const colors={trips:'#2a89f7',spending:'#a2010d',harbin:'#2a89f7',tianshui:'#6d7944'};
const state={year:2023,recovery:'actual',quarter:'trips',period:0,periodmode:'total',weight:'pooled',page:1,cloudcity:'both',annual:'trips'};
let filtered=[], resizeFrame=0,cloudSelection=null;
const topicById=Object.fromEntries(D.topics.map(t=>[t.id,t]));
const sourceTitles=Object.fromEntries(D.records.map(r=>[r.source,r.sourceTitle]));
const cities=['哈尔滨','天水'];
function selectButtons(attr,value){$$(`[data-${attr}]`).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attr]===String(value))));}
function dataTable(headers,rows){return `<table><thead><tr>${headers.map(x=>`<th scope="col">${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
function save(name,contents,type){const url=URL.createObjectURL(new Blob([contents],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}
function csvText(headers,rows){const q=x=>'"'+String(x??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';return '\uFEFF'+[headers,...rows].map(row=>row.map(q).join(',')).join('\r\n');}
function svgShell(w,h,title,body){return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${body}</svg>`;}

function renderRecovery(){
 const row=D.series.find(r=>r.year===state.year),base=D.series.find(r=>r.year===2019);
 $('#yearRange').value=state.year;$('#yearLabel').textContent=state.year;
 $('#tripsValue').textContent=state.recovery==='actual'?L(`${fmt(row.trips)} 亿`,fmt(row.trips)):fmt(row.trips/base.trips*100,1);
 $('#spendingValue').textContent=state.recovery==='actual'?L(`${fmt(row.spending)} 万亿`,fmt(row.spending)):fmt(row.spending/base.spending*100,1);
 const t=row.trips/base.trips*100,s=row.spending/base.spending*100;
 $('#yearInsight').textContent=state.year===2019?L('2019 是本图的参照年。恢复指数为 100；它是比较起点，不代表可达上限。','2019 is the reference year, with an index of 100. It is a comparison baseline, not an upper limit.'):L(`${state.year} 年，人次相当于 2019 年的 ${fmt(t,1)}%，名义花费相当于 ${fmt(s,1)}%。${state.year===2023?'两项较 2022 年大幅反弹，但仍低于 2019 年的总量。':''}`,`In ${state.year}, domestic trips were ${fmt(t,1)}% of the 2019 total and nominal spending was ${fmt(s,1)}%.${state.year===2023?' Both rebounded sharply from 2022 but remained below their 2019 totals.':''}`);
 drawLine('tripsPlot','trips',L('国内出游人次','Domestic trips'),L('亿人次','100 million trips'));drawLine('spendingPlot','spending',L('游客出游总花费','Total visitor spending'),L('万亿元','CNY trillion'));
}
function drawLine(id,key,label,unit){
 const host=document.getElementById(id),w=Math.max(260,Math.round(host.clientWidth)),h=242;
 const m={l:40,r:22,t:30,b:38},pw=w-m.l-m.r,ph=h-m.t-m.b;
 const base=D.series.find(r=>r.year===2019)[key];
 const values=D.series.map(r=>({...r,value:state.recovery==='actual'?r[key]:r[key]/base*100}));
 const step=state.recovery==='index'?30:(key==='trips'?20:2);
 const ymax=Math.ceil(Math.max(...values.map(d=>d.value))*1.08/step)*step;
 const x=y=>m.l+(y-2013)/10*pw,y=v=>m.t+ph-v/ymax*ph;
 let body=`<text class="chart-unit" x="0" y="12">${state.recovery==='actual'?unit:L('恢复指数（2019 = 100）','Recovery index (2019 = 100)')}</text>`;
 body+=`<rect x="${x(2019.7)}" y="${m.t}" width="${x(2022.3)-x(2019.7)}" height="${ph}" fill="#e8e3d7"/><text x="${(x(2020)+x(2022))/2}" y="${m.t+14}" text-anchor="middle" style="font-size:9px">2020—2022</text>`;
 for(let v=0;v<=ymax+.001;v+=step){body+=`<line x1="${m.l}" y1="${y(v)}" x2="${w-m.r}" y2="${y(v)}" stroke="#d9d1c1" stroke-width=".7"/><text x="${m.l-9}" y="${y(v)+4}" text-anchor="end">${v}</text>`;}
 if(state.recovery==='index'){body+=`<line x1="${m.l}" y1="${y(100)}" x2="${w-m.r}" y2="${y(100)}" stroke="#76685c" stroke-dasharray="3 4"/><text x="${w-m.r}" y="${y(100)-6}" text-anchor="end" style="font-size:9px">${L('2019 基准','2019 baseline')}</text>`;}
 [2013,2016,2019,2023].forEach(v=>body+=`<text x="${x(v)}" y="${h-16}" text-anchor="middle">${v}</text>`);
 body+=`<text x="${w-m.r}" y="${h-1}" text-anchor="end" style="font-size:9px">${L('年份','Year')}</text>`;
 body+=`<path d="${values.map((r,i)=>(i?'L':'M')+x(r.year).toFixed(2)+','+y(r.value).toFixed(2)).join(' ')}" fill="none" stroke="${colors[key]}" stroke-width="2.4" stroke-linejoin="round"/>`;
 const active=values.find(r=>r.year===state.year);
 body+=`<line x1="${x(state.year)}" y1="${m.t}" x2="${x(state.year)}" y2="${m.t+ph}" stroke="#3b1c15" stroke-width=".8" opacity=".35"/>`;
 values.forEach(r=>body+=`<circle cx="${x(r.year)}" cy="${y(r.value)}" r="${r.year===state.year?4.8:2.8}" fill="${r.year===state.year?colors[key]:'#f5f1e6'}" stroke="${colors[key]}" stroke-width="1.3"><title>${r.year}: ${fmt(r.value)} (${state.recovery==='index'?L('指数','index'):unit})</title></circle>`);
 body+=`<rect x="${m.l-10}" y="${m.t}" width="${pw+20}" height="${ph}" fill="transparent"/>`;
 host.innerHTML=svgShell(w,h,L(`${label}，2013至2023；当前${state.year}年${fmt(active.value)}${state.recovery==='index'?'指数':unit}。可用下方年份滑块读取全部值。`,`${label}, 2013–2023. Selected year ${state.year}: ${fmt(active.value)} (${state.recovery==='index'?'index':unit}). Use the year slider to read every value.`),body);
 const svg=host.querySelector('svg');
 function pick(e){const rect=svg.getBoundingClientRect();const px=(e.clientX-rect.left)*w/rect.width;const yr=Math.max(2013,Math.min(2023,Math.round(2013+(px-m.l)/pw*10)));if(yr!==state.year){state.year=yr;renderRecovery();}}
 svg.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')pick(e);});svg.addEventListener('pointerdown',pick);
}
function renderQuarter(){
 const host=$('#quarterPlot'),w=Math.max(260,Math.round(host.clientWidth)),h=218,m={l:39,r:15,t:38,b:32},pw=w-m.l-m.r,ph=h-m.t-m.b;
 const key=state.quarter,max=key==='trips'?16:200,step=key==='trips'?4:50,y=v=>m.t+ph-v/max*ph;
 let body=`<text class="chart-unit" x="0" y="13">${key==='trips'?L('亿人次','100 million trips'):L('同比增长 / %','Year-on-year growth / %')}</text>`;
 for(let v=0;v<=max;v+=step)body+=`<line x1="${m.l}" y1="${y(v)}" x2="${w-m.r}" y2="${y(v)}" stroke="#d9d1c1" stroke-width=".7"/><text x="${m.l-8}" y="${y(v)+4}" text-anchor="end">${v}</text>`;
 D.quarters.forEach((r,i)=>{const cx=m.l+pw*(i+.5)/4,bw=Math.min(62,pw/7),v=r[key];body+=`<rect x="${cx-bw/2}" y="${y(v)}" width="${bw}" height="${m.t+ph-y(v)}" fill="${(key==='trips'&&i===2)||(key==='growth'&&i===3)?'#2a89f7':'#bdc698'}"><title>${r.q}: ${fmt(v,key==='trips'?2:1)} (${key==='trips'?L('亿人次','100 million trips'):'%'})</title></rect><text x="${cx}" y="${y(v)-9}" text-anchor="middle" style="fill:#3b1c15;font-size:12px">${fmt(v,key==='trips'?2:1)}${key==='growth'?'%':''}</text><text x="${cx}" y="${h-10}" text-anchor="middle">${r.q}</text>`;});
 host.innerHTML=svgShell(w,h,L(`2023年季度${key==='trips'?'出游人次':'同比增长率'}：`,`Quarterly ${key==='trips'?'domestic trips (100 million trips)':'year-on-year growth (%)'} in 2023: `)+D.quarters.map(r=>r.q+' '+r[key]).join('; '),body);
}
function renderPeriod(){
 const p=D.cityPeriods[state.period],daily=state.periodmode==='daily',div=daily?p.days:1;
 const en=window.MIA_LANGUAGE==='en',spring=p.period.includes('春节');
 const holiday=spring?'Spring Festival':'Qingming Festival';
 const city=p.city==='天水'?'Tianshui':'Harbin';
 $('#periodKicker').textContent=en?holiday+' 2024 / '+p.days+' days':p.period+' / '+p.days+' 天';
 $('#periodTitle').textContent=en?city+', '+holiday+' holiday':p.city+'，'+(spring?'春节假期':'清明假期');
 $('#periodTrips').textContent=fmt(p.trips/div,p.trips/div>=100?1:2);$('#periodSpend').textContent=fmt(p.spending/div,2);
 $('#periodTripsLabel').textContent=en?(daily?'Daily visitor trips (10,000s per day)':'Visitor trips (10,000s)'):(daily?'日均接待（万人次/日）':'接待游客（万人次）');
 $('#periodSpendLabel').textContent=en?(daily?'Daily tourism revenue (CNY 100 million per day)':'Tourism revenue (CNY 100 million)'):(daily?'日均收入（亿元/日）':'旅游收入（亿元）');
 const tm=Math.max(...D.cityPeriods.map(x=>x.trips/(daily?x.days:1))),sm=Math.max(...D.cityPeriods.map(x=>x.spending/(daily?x.days:1)));
 $('#periodTripsBar i').style.width=(p.trips/div/tm*100)+'%';$('#periodSpendBar i').style.width=(p.spending/div/sm*100)+'%';
 $('#periodNote').textContent=en
  ? (daily?'Daily averages divide each holiday total by the number of days.':'The figures are totals for this holiday period.')+' '+(state.period===1?'These figures predate the March malatang boom and cannot be attributed to it.':'Reporting coverage may vary by city and holiday. See the source for details.')
  : (daily?'日均值由本页用假期总量 ÷ 天数换算。':'数字为该统计期的总量。')+(state.period===1?'这组数据早于 3 月的麻辣烫热潮，不归因于后续走红。':'不同城市与假期的统计范围可能不同，请结合来源阅读。');
 $('#periodSource').href='#source-'+p.source;
}
function topicRate(city,topic){const rs=D.records.filter(r=>r.city===city);if(state.weight==='pooled')return rs.filter(r=>r.topics.includes(topic)).length/rs.length*100;const groups=[...new Set(rs.map(r=>r.source))];return groups.reduce((sum,s)=>{const a=rs.filter(r=>r.source===s);return sum+a.filter(r=>r.topics.includes(topic)).length/a.length*100;},0)/groups.length;}
function renderTopics(){
 const vals=D.topics.map(t=>({...t,rates:cities.map(c=>topicRate(c,t.id))}));
 // One shared 0–30% scale covers every topic in either weighting mode.
 const scale=30;
 $('#topicChart').innerHTML=vals.map(t=>`<button class="topic-row" data-topic="${t.id}" aria-label="${esc(L(`查看${t.label}相关评论。哈尔滨${fmt(t.rates[0],1)}%，天水${fmt(t.rates[1],1)}%`,`Read comments about ${tr(t.label)}. Harbin ${fmt(t.rates[0],1)}%; Tianshui ${fmt(t.rates[1],1)}%.`))}"><span class="topic-name">${esc(tr(t.label))}<span aria-hidden="true">${L('读评论 ↗','Read comments ↗')}</span></span>${cities.map((city,i)=>`<span class="theme-bar-row"><span>${tr(city)}</span><span class="theme-track"><i style="width:${t.rates[i]/scale*100}%;background:${i?colors.tianshui:colors.harbin}"></i></span><b>${fmt(t.rates[i],1)}%</b></span>`).join('')}</button>`).join('');
 $('#weightNote').textContent=L(`共同横向尺度：0—30%。${state.weight==='pooled'?'按评论合并：命中条数 / 该城保留条数。样本量大的视频影响更大。':'每个视频等权：各城三个来源的命中率取简单平均。小样本视频的影响会上升。'}主题可以重叠，比例不相加。`,`Shared scale: 0–30%. ${state.weight==='pooled'?'Pooled comments: matching comments divided by retained comments for each city. Larger video samples have more influence.':'Equal video weights: a simple average of the three source-specific rates in each city. Smaller samples gain influence.'} Topics can overlap; percentages do not add up.`);
 $$('[data-topic]').forEach(b=>b.addEventListener('click',()=>{$('#topicFilter').value=b.dataset.topic;$('#cityFilter').value='all';$('#sourceFilter').value='all';$('#searchFilter').value='';cloudSelection=null;state.page=1;renderComments();$('#explorer').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}));
}
function highlight(text){const terms=T.terms($('#searchFilter').value).filter(Boolean).sort((a,b)=>b.length-a.length);if(!terms.length)return esc(text);const pattern=new RegExp(terms.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'gi');let html='',last=0;for(const match of text.matchAll(pattern)){html+=esc(text.slice(last,match.index))+'<mark>'+esc(match[0])+'</mark>';last=match.index+match[0].length}return html+esc(text.slice(last));}
function renderComments(){
 const city=$('#cityFilter').value,topic=$('#topicFilter').value,source=$('#sourceFilter').value,query=$('#searchFilter').value.trim().toLowerCase();
 const searchTerms=T.terms(query);
 filtered=D.records.filter(r=>(city==='all'||r.city===city)&&(source==='all'||r.source===source)&&(topic==='all'||(topic==='unmatched'?!r.topics.length:r.topics.includes(topic)))&&(!query||(cloudSelection&&query===cloudSelection.query?cloudSelection.ids.has(r.id):searchTerms.some(term=>r.text.toLowerCase().includes(term)))));
 const cloudNote=$('#cloudSelectionNote');cloudNote.hidden=!cloudSelection;cloudNote.textContent=cloudSelection?.imported?L('原评论库中的原文示例（与新词云统计口径不同）。','Examples from the original comment library (a different sample from the new word clouds).'):cloudSelection?L(`词云精确匹配：「${cloudSelection.word}」；下方结果可继续按主题与视频筛选。手动修改关键词可切换为全文搜索。`,`Exact word-cloud matches: ${tr(cloudSelection.word)}. You can further filter by topic and video. Edit the search text to switch to full-text search.`):'';
 const size=6,pages=Math.max(1,Math.ceil(filtered.length/size));state.page=Math.min(state.page,pages);const from=(state.page-1)*size,records=filtered.slice(from,from+size);
 $('#resultsCount').textContent=L(`找到 ${num(filtered.length)} 条评论${filtered.length?` · 当前 ${from+1}–${from+records.length}`:''}`,`${num(filtered.length)} comments${filtered.length?` · showing ${from+1}–${from+records.length}`:''}`);
 $('#commentList').innerHTML=records.length?records.map(r=>{const gloss=T.gloss(r,D.topics);return `<article class="comment-card" data-city="${esc(r.city)}"><div class="comment-meta"><span class="comment-city">${esc(tr(r.city))} / ${r.source}</span><span>${r.date||L('原表未记录日期','Date not recorded in the source')}</span></div>${T.en()?`<div class="comment-gloss" lang="en" data-no-translate><strong>${esc(gloss.label)}</strong><p>${esc(gloss.text)}</p></div>`:''}<details class="comment-original"><summary>${L('阅读中文原文','Read original in Chinese')}</summary><blockquote lang="zh-CN" data-no-translate data-source-original>${highlight(r.text)}</blockquote></details><p class="comment-source">${esc(tr(r.sourceTitle))}</p><div class="comment-tags">${r.topics.length?r.topics.map(id=>`<span>${esc(tr(topicById[id].label))}</span>`).join(''):`<span>${L('未命中词典','No dictionary topic matched')}</span>`}</div></article>`}).join(''):`<p class="empty-results">${L('没有符合这些条件的评论。可以更换关键词或清除筛选。','No comments match these filters. Try another keyword or clear the filters.')}</p>`;
 $('#pageLabel').textContent=`${state.page} / ${pages}`;$('#prevPage').disabled=state.page===1;$('#nextPage').disabled=state.page===pages;
 $('#downloadComments').disabled=filtered.length===0;
}
function renderMethods(){
 $('#sourcesList').innerHTML=D.sources.map(s=>`<li id="source-${s.id}"><div><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(tr(s.title))} ↗</a><p>${esc(tr(s.publisher))} · ${s.date}<br>${esc(tr(s.use))}</p></div></li>`).join('');
 $('#dictionary').innerHTML=D.topics.map(t=>`<div class="dictionary-row"><strong>${esc(tr(t.label))}</strong><span><details><summary>${L('关键词及英文释义','Original keyword tokens and English glosses')}</summary><ul>${t.keywords.map(k=>`<li><span data-no-translate data-source-original lang="zh-CN">${esc(k)}</span> — <span lang="en" data-no-translate>${esc(T.words[k]||k)}</span></li>`).join('')}</ul></details></span></div>`).join('');
 $('#unmatchedStats').textContent=L('未命中任何主题的评论：'+cities.map(c=>`${c} ${num(D.unmatched[c])} / ${num(D.totals[c])}`).join('，')+'。','Comments matching no topic: '+cities.map(c=>`${tr(c)} ${num(D.unmatched[c])} / ${num(D.totals[c])}`).join('; ')+'.');
 $('#sourceSampleTable').innerHTML=dataTable([L('来源组','Source group'),L('视频主题（据原文件）','Video topic from source file'),L('保留评论','Retained comments'),L('归属说明','Attribution notes')],Object.entries(sourceTitles).sort().map(([id,title])=>[id,tr(title),num(D.records.filter(r=>r.source===id).length),id==='H2'?L('文件名与重复页面上下文；缺视频ID独立验证','File name and repeated page context; not independently verified by video ID'):L('原文件名；缺完整源视频ID与链接','Original file name; complete source video ID and link unavailable')]));
 $('#nationalTable').innerHTML=dataTable([L('年份','Year'),L('国内出游 / 亿人次','Domestic trips / 100 million trips'),L('名义花费 / 万亿元','Nominal spending / CNY trillion')],D.series.map(r=>[r.year,fmt(r.trips),fmt(r.spending)]));
}


const cloudHosts={'哈尔滨':'cloudHarbin','天水':'cloudTianshui'};
function openCloudWord(city,item){
 cloudSelection={word:item.word,query:tr(item.word).toLowerCase(),ids:new Set(item.indices.map(i=>D.records[i].id))};
 $('#cityFilter').value=city;$('#topicFilter').value='all';$('#sourceFilter').value='all';$('#searchFilter').value=tr(item.word);state.page=1;renderComments();
 $('#explorer').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 $('#searchFilter').focus({preventScroll:true});
}
function renderClouds(){
 window.MIA_CLOUD_READY=false;
 $('#cloudGrid').classList.toggle('single',state.cloudcity!=='both');
 const staging=document.createElement('div');
 window.MiaCityWordclouds.mount(staging,{language:T.en()?'en':'zh',onWord:({city,keyword})=>{
  const name=city==='harbin'?'哈尔滨':'天水';
  const indices=D.records.flatMap((r,i)=>r.city===name&&r.text.includes(keyword)?[i]:[]);
  openCloudWord(name,{word:keyword,indices});
  cloudSelection.imported=true;renderComments();
 }});
 for(const [key,city] of [['harbin','哈尔滨'],['tianshui','天水']]){
  const host=document.getElementById(cloudHosts[city]),card=host.closest('[data-cloud-card]');
  card.hidden=state.cloudcity!=='both'&&state.cloudcity!==city;
  const source=staging.querySelector(`[data-city="${key}"]`);
  host.classList.remove('mia-shaped-cloud');host.classList.add('mia-imported-cloud');
  host.replaceChildren(source.querySelector('svg'));
  const status=source.querySelector('.mia-cloud-status');
  status.id=cloudHosts[city]+'Note';status.classList.add('cloud-readout');
  document.getElementById(status.id).replaceWith(status);
  status.textContent=L('点击词语或按回车查看统计与原评论库中的示例。','Click a word or press Enter for statistics and examples from the original comment library.');
  card.querySelector('.cloud-heading p').textContent=source.querySelector('header p').textContent;
 }
 window.MIA_CLOUD_READY={language:T.en()?'en':'zh',source:'Wordcloud_Integration'};
}
function renderAnnual(){
 $('#annualCards').innerHTML=D.annualFollowup.map(r=>{const trips=state.annual==='trips',growth=r[trips?'tripsGrowth':'spendingGrowth'];return `<article class="annual-card"><h4>${esc(tr(r.city))} <a href="#source-${r.source}" class="ref">[${r.source.slice(1)}]</a></h4><div class="annual-total">${fmt(trips?r.trips:r.spending,trips?0:1)}<span>${trips?L('万人次','10,000 visitor trips'):L('亿元','CNY 100 million')}</span></div><p>${L('2024 全年','Full year 2024')} · ${trips?L('接待游客','Visitor trips'):esc(tr(r.spendingLabel))}</p><div class="growth-head"><span>${L('较 2023 全年','Compared with full year 2023')}</span><strong>+${fmt(growth,1)}%</strong></div><div class="growth-track" role="img" aria-label="${esc(L(`${r.city}同比增长${growth}%，共同尺度0到40%`,`${tr(r.city)}: ${growth}% year-on-year growth; shared scale 0–40%`))}"><i style="width:${growth/40*100}%"></i></div><div class="growth-ticks" aria-hidden="true"><span>0%</span><span>20%</span><span>40%</span></div></article>`;}).join('');
}
function renderWordMethods(){
 $('#cloudTable').innerHTML=dataTable([L('城市','City'),L('词语','Word / English gloss'),L('含词评论数','Comments containing the word'),L('占该城评论','Share of city sample')],cities.flatMap(city=>D.wordClouds[city].map(x=>[tr(city),tr(x.word),x.count,fmt(x.rate,2)+'%'])));
 const original=token=>`<span data-no-translate data-source-original lang="zh-CN">${esc(token)}</span>`;
 const stopwords=$('#cloudStopwords');stopwords.removeAttribute('data-no-translate');stopwords.lang=T.en()?'en':'zh-CN';
 stopwords.innerHTML=`${L('停用词：','Exact stopwords excluded from Chinese tokenisation: ')}${D.wordCloudMethod.stopwords.map(original).join(' / ')}<br>${L('固定词及英文释义：','Compound tokens and English glosses: ')}${D.wordCloudMethod.compounds.map(k=>original(k)+' — '+esc(T.words[k]||k)).join('; ')}<br>${L('分词版本：','Tokeniser: ')}${esc(D.wordCloudMethod.algorithm)}`;
 stopwords.parentElement.querySelector('summary').textContent=L('原始中文词表与固定词释义','Original Chinese token lists and compound-word glosses');
}
$$('[data-cloudcity]').forEach(b=>b.addEventListener('click',()=>{state.cloudcity=b.dataset.cloudcity;selectButtons('cloudcity',state.cloudcity);renderClouds();}));
$$('[data-annual]').forEach(b=>b.addEventListener('click',()=>{state.annual=b.dataset.annual;selectButtons('annual',state.annual);renderAnnual();}));

$('#heroCount').textContent=num(D.records.length);$('#t3Share').textContent=fmt(D.records.filter(r=>r.source==='T3').length/D.totals['天水']*100,1)+'%';
D.topics.forEach(t=>$('#topicFilter').insertAdjacentHTML('beforeend',`<option value="${t.id}">${esc(tr(t.label))}</option>`));
Object.entries(sourceTitles).sort().forEach(([id,title])=>$('#sourceFilter').insertAdjacentHTML('beforeend',`<option value="${id}">${id} · ${esc(tr(title))}</option>`));
[['recovery',renderRecovery],['quarter',renderQuarter],['period',renderPeriod],['periodmode',renderPeriod],['weight',renderTopics]].forEach(([attr,fn])=>$$(`[data-${attr}]`).forEach(b=>b.addEventListener('click',()=>{state[attr]=attr==='period'?Number(b.dataset[attr]):b.dataset[attr];selectButtons(attr,state[attr]);fn();})));
$('#yearRange').addEventListener('input',e=>{state.year=Number(e.target.value);renderRecovery();});
['cityFilter','topicFilter','sourceFilter'].forEach(id=>document.getElementById(id).addEventListener('change',()=>{state.page=1;renderComments();}));
$('#searchFilter').addEventListener('input',()=>{cloudSelection=null;state.page=1;renderComments();});
$('#resetFilters').addEventListener('click',()=>{$('#cityFilter').value='all';$('#topicFilter').value='all';$('#sourceFilter').value='all';$('#searchFilter').value='';cloudSelection=null;state.page=1;renderComments();});
$('#prevPage').addEventListener('click',()=>{state.page--;renderComments();});$('#nextPage').addEventListener('click',()=>{state.page++;renderComments();});
$('#downloadComments').addEventListener('click',()=>save('city-comments-filtered.csv',csvText(L(['匿名记录号','城市','来源组','视频标题','评论原文（已匿名化）','评论日期','命中主题'],['Anonymous record ID','City','Source group','Video title','Anonymised Chinese original','Comment date','Matched topics']),filtered.map(r=>[r.id,tr(r.city),r.source,tr(r.sourceTitle),r.text,r.date,r.topics.map(id=>tr(topicById[id].label)).join(' / ')])),'text/csv;charset=utf-8'));
$$('[data-download]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.download==='national')save('china-domestic-tourism-2013-2023.csv',csvText(L(['年份','国内出游亿人次','名义旅游花费万亿元'],['Year','Domestic trips (100 million trips)','Nominal spending (CNY trillion)']),D.series.map(r=>[r.year,r.trips,r.spending])),'text/csv;charset=utf-8');else save('city-goes-viral-data-and-methods.json',JSON.stringify(D,null,2),'application/json;charset=utf-8');}));
const sections=$$('main>section[id]');
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){$$('.masthead nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}});},{rootMargin:'-15% 0px -60% 0px'});sections.forEach(s=>observer.observe(s));
let scrollScheduled=false;addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;$('#readingProgress').style.width=(max>0?scrollY/max*100:0)+'%';scrollScheduled=false;});}},{passive:true});
const plotWidths=new WeakMap();const resize=new ResizeObserver(entries=>{let changed=false;for(const entry of entries){const width=entry.contentRect.width;if(Math.abs(width-(plotWidths.get(entry.target)??-1))>.5){plotWidths.set(entry.target,width);changed=true}}if(!changed)return;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{renderRecovery();renderQuarter();renderClouds();});});['tripsPlot','spendingPlot','quarterPlot','cloudGrid'].forEach(id=>resize.observe(document.getElementById(id)));
function renderAll(){
 renderMethods();renderRecovery();renderQuarter();renderPeriod();renderTopics();renderComments();renderAnnual();renderWordMethods();renderClouds();T.localizeAttributes();
 window.MIA_TOURISM_HERO?.layout();
 let cloudGloss=$('#cloudGlossNote');if(!cloudGloss){cloudGloss=document.createElement('p');cloudGloss.id='cloudGlossNote';cloudGloss.className='source-note';$('#cloudGrid').after(cloudGloss)}
 cloudGloss.textContent=L('新词云基于哈尔滨 837 条、天水 2,780 条去重评论，按字面子串计数，每条评论每词最多计一次。英文为中文关键词释义；小字重复用于填充轮廓。点击后显示新统计，下方仅提供原评论库中的原文示例，口径不同，示例数量不等于词云计数。下方词表与分词说明保留原评论库口径。','These word clouds use 837 deduplicated Harbin comments and 2,780 Tianshui comments, with literal substring matching counted once per word per comment. English labels are glosses; some small words repeat to fill the shapes. Click for the new statistics and original-library examples below. The samples differ, so example totals do not equal cloud counts. The table and tokenisation notes below describe the original library.');
 let searchHelp=$('#searchLanguageNote');if(!searchHelp){searchHelp=document.createElement('p');searchHelp.id='searchLanguageNote';searchHelp.className='source-note';$('#explorer .filters').after(searchHelp)}
 searchHelp.textContent=L('关键词可输入中文，也可输入对应的英文释义。下载的数据保留中文原始评论；英文摘要或关键词语境不用于推断情感或立场。','You can search with Chinese keywords or mapped English glosses. Downloads retain the Chinese source comments. Reading summaries and keyword context do not classify sentiment or stance.');
}
renderAll();addEventListener('mia-language-ready',renderAll);
window.reportReady={records:D.records.length,nationalYears:D.series.length,version:D.version,cloudWords:60,afterPanels:1};
})();
