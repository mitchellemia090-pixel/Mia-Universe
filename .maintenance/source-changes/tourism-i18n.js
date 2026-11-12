/* Page-specific language, exact source tokens, and search aliases. No data conversion. */
(() => {
 const words={
  '哈尔滨':'Harbin','天水':'Tianshui','推荐':'recommendations','美食':'food','好吃':'tasty','地图':'map','冬天':'winter','南方':'southern China','本地':'local','淄博':'Zibo','希望':'hope','夏天':'summer','想去':'want to visit','真诚':'sincerity','热情':'warm hospitality','特色':'local character','冰雪大世界':'Ice and Snow World','服务':'service','烧烤':'barbecue','中央大街':'Central Street','攻略':'travel guide','黑龙江':'Heilongjiang','欢迎':'welcome','朋友':'friends','小土豆':'little potatoes','东北人':'northeastern Chinese people','附近':'nearby','开心':'happiness','好玩':'fun','北方':'northern China','便宜':'inexpensive','才是':'what really matters','麻辣烫':'malatang','文化':'culture','消费':'spending','经济':'economy','历史':'history','游客':'visitors','流量':'online attention','伏羲':'Fuxi','发展':'development','宣传':'promotion','麦积山':'Maijishan','兰州':'Lanzhou','西安':'Xi’an','石窟':'grottoes','西北':'northwestern China','挺好':'quite good','推手':'promoters','陕西':'Shaanxi','政府':'government','敦煌':'Dunhuang','眼睛':'eyes','国家':'country','景点':'attractions',
  '饮食与味道':'Food and taste','冰雪与气候':'Ice, snow and climate','文化与城市空间':'Culture and urban space','待客与服务':'Hospitality and service','价格与消费':'Prices and spending','流量与宣传':'Online attention and promotion',
  '吃的':'food','小吃':'snacks','红肠':'red sausage','锅包肉':'guobaorou (crispy sweet-and-sour pork)','餐饮':'dining','辣椒':'chilli','食物':'food','味道':'flavour','口味':'taste','饭店':'restaurants','餐厅':'restaurants','冰雪':'ice and snow','下雪':'snowfall','冬季':'winter','太冷':'too cold','寒冷':'cold weather','零下':'below zero','冻':'freezing','雪景':'snow scenery','怕冷':'sensitivity to cold','保暖':'keeping warm','夏季':'summer','气候':'climate','建筑':'architecture','教堂':'churches','索菲亚':'Saint Sophia Cathedral','三国':'Three Kingdoms','姜维':'Jiang Wei','博物馆':'museums','古城':'old town','景区':'scenic sites','公园':'parks','热心':'helpfulness','好客':'hospitality','招待':'hosting','友好':'friendliness','待客':'hospitality','宠':'being pampered','接待':'welcoming visitors','暖心':'heartwarming care','实在':'genuineness','善良':'kindness','价格':'prices','太贵':'too expensive','很贵':'very expensive','真贵':'really expensive','不贵':'not expensive','贵了':'more expensive','贵不贵':'whether it is expensive','花钱':'spending money','收入':'income','没钱':'lack of money','工资':'wages','物价':'consumer prices','成本':'costs','挣钱':'earning money','赚钱':'earning money','网红':'internet fame','炒作':'hype','跟风':'following a trend','热度':'attention','爆火':'going viral','走红':'becoming popular','营销':'marketing','出圈':'reaching a wider audience','互联网':'internet','短视频':'short videos','反感':'dislike','莫名其妙':'bewilderment','审美疲劳':'aesthetic fatigue',
  '泼天富贵':'a sudden windfall','哈尔滨人':'Harbin residents','天水人':'Tianshui residents','南方人':'southerners','西北人':'northwesterners','张家界':'Zhangjiajie','文旅局':'culture and tourism bureau','新疆':'Xinjiang','尔滨':'Erbin (Harbin nickname)',
 };
 const sourceTitles={
  '这“泼天富贵”，为啥轮到哈尔滨？':'Why has this sudden windfall come to Harbin?',
  '哈尔滨：中国面积最大的省会，东亚文化之都':'Harbin: China’s largest provincial capital by area and a cultural city of East Asia',
  '哈尔滨旅游与美食攻略':'A travel and food guide to Harbin',
  '全国城市随机旅行——天水，我来了！':'Random city travel in China: Tianshui, here I come!',
  '甘肃天水是个什么样的地方':'What kind of place is Tianshui, Gansu?',
  '天水麻辣烫爆火：走红有套路模板吗？':'Tianshui malatang goes viral: is there a template for online fame?',
 };
 const excerpts={
  'H1-0001-95fea':'The commenter recalls exceptionally warm hospitality in northeastern China: hotel staff offered extra water and a shopkeeper offered filtered water for tea. They also describe generous, inexpensive food, feel the region deserved attention earlier, and say they would return.',
  'H1-0002-a744d':'The commenter invokes Fan Zhongyan’s phrase about effective government and social harmony, presenting it as a long-standing lesson in governing.',
  'H1-0003-58f77':'The commenter sees the city’s sudden success as the result of years of preparation and persistence: it was ready when the opportunity arrived.',
  'H1-0004-fa283':'The commenter is delighted that their hometown Harbin has become popular, but worries the excitement may fade after the ice-and-snow season. They hope public-minded government and practical local initiative can sustain the city’s vitality and livelihoods.',
  'H1-0005-06d6f':'The commenter recommends Harbin in both summer and winter, describes northeastern summers as pleasant, and recalls winter scenery, ice slides and childhood memories near the China–Russia border in Heihe.',
  'H1-0006-55c7c':'The commenter says an initially cheerful video became moving because of the warmth and solidarity it showed.',
 };
 const en=()=>window.MIA_LANGUAGE==='en';
 const choose=(zh,english)=>en()?english:zh;
 const word=value=>en()?(words[value]||sourceTitles[value]||window.MIA_TRANSLATIONS?.[value]?.[0]||value):value;
 function terms(query){
  const q=query.trim().toLowerCase();if(!q)return [];
  const aliases={'publicity':['宣传'],'spicy hot pot':['麻辣烫'],'hot pot':['麻辣烫'],'hospitality':['热情','好客','服务'],'food':['美食','食物','吃的'],'promotion':['宣传'],'service':['服务']};
  return aliases[q]||[...new Set(Object.entries({...words,...window.MIA_TOURISM_CLOUDS?.aliases}).filter(([,value])=>value.toLowerCase()===q).map(([token])=>token).concat(Object.entries(words).filter(([,value])=>value.toLowerCase()===q).map(([token])=>token),q))];
 }
 function gloss(record,topics){
  if(excerpts[record.id])return {label:'English reading summary',text:excerpts[record.id]};
  const matched=[...new Set(topics.flatMap(t=>t.keywords).filter(token=>record.text.includes(token)).concat(Object.keys(words).filter(token=>record.text.includes(token))))].sort((a,b)=>b.length-a.length).slice(0,6);
  return {label:'English keyword context · not a full translation',text:matched.length?`Words in this comment: ${matched.map(word).join('; ')}. Read the original for the exact wording, negation and stance.`:`Source discussion: ${word(record.sourceTitle)}. No preset keyword theme is matched; the original wording is preserved below.`};
 }
 const attributes={
  '返回报道开头':'Return to the start of the story','报道章节':'Story sections','哈尔滨与天水的编辑插画，不代表数据':'Editorial illustration of Harbin and Tianshui; not a data chart','全国趋势显示方式':'National trend display mode','季度指标':'Quarterly measure','选择统计期':'Choose a reporting period','假期数据换算方式':'Holiday totals or daily averages','词云显示城市':'Cities shown in the word clouds','哈尔滨高频词，点击或按回车查看相关评论':'Harbin word frequencies; select a word to read matching comments','天水高频词，点击或按回车查看相关评论':'Tianshui word frequencies; select a word to read matching comments','主题比较加权方式':'Topic comparison weighting','全年旅游指标':'Full-year tourism measure',
 };
 function localizeAttributes(){
  for(const e of document.querySelectorAll('[aria-label]')){const original=e.getAttribute('aria-label');if(attributes[original])e.setAttribute('aria-label',choose(original,attributes[original]));}
  document.querySelector('#searchFilter').placeholder=choose('搜索：服务、麻辣烫、宣传…','Search: service, malatang, promotion…');
 }
 window.MIA_TOURISM={en,choose,word,terms,gloss,words,localizeAttributes};
})();
