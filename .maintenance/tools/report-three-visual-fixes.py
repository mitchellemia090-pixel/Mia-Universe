from pathlib import Path
import json,re,hashlib,subprocess,shutil
root=Path('pages-release-review/three-visual-fixes');checks=json.loads((root/'validation.json').read_text(encoding='utf8'))
assert len(checks)==10
for case in checks:
 assert case['home']['zoom']==1 and case['home']['fonts']=='loaded' and not case['home']['overflow']
 assert case['home']['gap']>=8
 assert case['home']['labels'][2]['clip']=='none'
 assert min(case['home']['labels'][2][k] for k in ('left','right','top','bottom'))>=2
 assert case['clouds']['ready'] and not case['clouds'].get('error') and case['clouds']['counts']==[30,30]
 assert all(case['clouds']['sets']) and case['clouds']['fallbacks']==0 and case['clouds']['pathTextFits']
 assert len(set(case['clouds']['fontScales']))==1 and not case['clouds']['overflow']
 assert all(not caption['covered'] and caption['bottomPadding']>=20 for caption in case['captions'])
 assert all(s['commentsMatch'] and s['countMatches'] and s['selectedCity']==s['city'] for s in case['selected'])
 assert not case['errors']
source=Path('integrated-v2/projects/When_a_City_Goes_Viral.html').read_text(encoding='utf8')
old=subprocess.check_output(['git','-C','github-pages-v2','show','9f5a398:projects/When_a_City_Goes_Viral.html']).decode('utf8')
data=lambda s:re.search(r'<script[^>]*id=.reportData.[^>]*>(.*?)</script>',s,re.S)[1]
assert data(old)==data(source)
backup=Path('local-versions/before-word-only-clouds-20261110-233834/When_a_City_Goes_Viral.html')
assert json.loads(data(backup.read_text(encoding='utf8')))['wordClouds']==json.loads(data(source))['wordClouds']
digest=hashlib.sha256(data(source).encode()).hexdigest()
for name in ('index.html','navigation.js','universe.css','tourism-story.js','tourism-story.css','tourism-clouds.js','tourism-hero.js','tourism-i18n.js'):
 assert (Path('integrated-v2')/name).read_bytes()==(Path('github-pages-v2')/name).read_bytes()
report=f'''# 首页贴纸、城市卡片与双城词云

基于远端 Pages 的最新版 `9f5a3982d40616230819206b59765e4547f02a7a`。源项目 `integrated-v2/`，生成副本 `github-pages-v2/`。本报告中的截图来自本地发布预览，不表示已部署线上。

## 首页 Selected Work

纸带的锯齿 clip-path 移到独立背景伪元素，文字层不再裁切。`document.fonts.ready` 和字体加载完成事件后，用实际字体度量整行宽度，桌面纸带宽度为测量值加左右各 24px；窄屏使用两行及安全内边距。

六个标签在字体加载后检查实际字符范围，桌面 1440px、手机 375px、补充窄屏 320px，浏览器缩放均为 1.0，Selected Work 和 Archive 的间距均至少 8px，避开人物头顶，未修改人物、发饰、云层和蓝色背景。

## 城市卡片

源码原句分别是 `冰雪 · 待客 · 城市想象` 和 `饮食 · 宣传 · 地方日常`，当前字典完整英文为：

- Harbin：**Snow · Hospitality · Imagining a city**
- Tianshui：**Food · Publicity · Local life**

原卡片使用 330px 固定高度及 overflow:hidden，共享正文样式又放大了段落。现在卡片按内容定高，底部文案独立排版并保留 23–24px 内边距。保持 -9° / +9° 倾斜叠放，按实际旋转后的边界缩放到可用宽度。还修复了手机上 `TWO CITIES…` 装饰注释盖住哈尔滨底部文案的问题：注释现在位于两张卡片下方。

每种语言和宽度都逐字进行命中检查，20 份底部文案均未被另一张卡片、注释或外层容器覆盖。

## 真正的双城词云

已查阅并恢复两份备份中的词频来源、权重口径和分词索引处理：

- `local-versions/before-word-only-clouds-20261110-233834/When_a_City_Goes_Viral.html`
- `local-versions/before-shaped-clouds-20261110-232331/When_a_City_Goes_Viral.html`

第一份备份的 wordClouds 数据与当前完全相同。新的 `tourism-clouds.js` 用可交互 SVG 文字路径组成帽子、雪人头部和身体，以及宽口碗的碗口与碗身；小眼点和竹签辅助识别。页面不再使用词频列表兜底，也没有把文字放进实心轮廓图片。

Harbin 使用品牌蓝 `#3D8CDB` 和可可棕 `#3B1C15`；Tianshui 使用樱桃红 `#A2010D` 和可可棕。每城仍为原来的 30 个关键词，各出现一次。两城共同使用含词评论占比、同一全局最大占比和平方根字号函数；同一视口下共用适配系数。中文与英文分别计算排版，手机上下显示。

部分英文长释义在图中使用简洁显示形式，例如 northeasterners、govt.；悬浮说明和评论入口继续提供完整英文释义及原始统计，短形式也可通过搜索映射回中文原词。

实际鼠标点击验证：

| 城市 / 关键词 | 对应评论数 | 城市总评论 | 占比 | 验证 |
| --- | ---: | ---: | ---: | --- |
| Harbin / 服务（service） | 14 | 835 | 1.68% | 结果数量、城市筛选、原始索引及首屏六条中文原句一致 |
| Tianshui / 麻辣烫（malatang） | 331 | 2,789 | 11.87% | 同上 |

这是分词精确索引的结果，不替换为普通全文子串搜索的 65 / 337 条。原始评论通过明确的 Read original in Chinese 入口展开，英文界面和词云提示使用英文。

全部 reportData（3,624 条评论、数值、频率、索引）与 9f5a398 逐字相同。SHA-256：`{digest}`。

## 验证范围

本地源与 `/Mia-Universe/` 发布预览：1440×1000、375×1000，中英文分别测试；发布预览额外测试 320×1000。合计 10 个场景、20 次实际关键词点击。

- 字体状态 loaded，缩放 100%，没有页面横向溢出。
- 每图 30 个唯一原始词语；两图共用字号尺度。
- 文字路径长度足够，未被路径边界切断；两份评论集与原始索引一致。
- 无脚本异常。静态资源路径/大小写检查通过，316 条路径无错误。
- 样式及脚本入口增加版本参数，避免部署后沿用旧缓存。

验证明细见 validation.json。截图只进行了从真实浏览器截图中裁去相邻列的处理，没有重绘页面内容。

## 修复后截图

- [桌面首页](Mia-Universe-1440-en-home.png) · [手机首页](Mia-Universe-375-en-home.png) · [320px 首页](Mia-Universe-320-en-home.png)
- [桌面双城卡片](Mia-Universe-1440-en-cards.png) · [手机双城卡片](Mia-Universe-375-en-cards.png)
- [英文雪人](snowman-1440-en.png) · [英文碗](bowl-1440-en.png)
- [中文雪人](snowman-1440-zh.png) · [中文碗](bowl-1440-zh.png)
- [手机英文雪人](snowman-375-en.png) · [手机英文碗](bowl-375-en.png)
- [Harbin 点击结果](Mia-Universe-375-en-harbin-clicked.png) · [Tianshui 点击结果](Mia-Universe-375-en-tianshui-clicked.png)

构图参考为用户给出的 [snowman](https://lapopart.com/products/vysnowman)、[碗口与蒸汽](https://www.wordclouds.com/gallery/coffee.webp)、[蒙版词云](https://amueller.github.io/word_cloud/auto_examples/masked.html)。只参考构图，页面渲染使用自己的 SVG 文字与原有数据。
'''
(root/'REPORT.md').write_text(report,encoding='utf8')
destination=Path('github-pages-v2/.maintenance/verification/three-visual-fixes');destination.mkdir(parents=True,exist_ok=True)
names=['REPORT.md','validation.json']
names += ['Mia-Universe-'+w+'-en-'+kind+'.png' for w in ['1440','375','320'] for kind in ['home','cards']]
names += [shape+'-'+w+'-'+lang+'.png' for shape in ['snowman','bowl'] for w in ['1440','375'] for lang in ['en','zh']]
names += ['Mia-Universe-375-en-'+city+'-clicked.png' for city in ['harbin','tianshui']]
for name in names:shutil.copy2(root/name,destination/name)
for name in ['validate-three-visual-fixes.mjs','capture-final-word-clouds.mjs','crop-word-cloud-screenshots.py','report-three-visual-fixes.py']:
 shutil.copy2(Path('task-tools')/name,Path('github-pages-v2/.maintenance/tools')/name)
print(root/'REPORT.md')
