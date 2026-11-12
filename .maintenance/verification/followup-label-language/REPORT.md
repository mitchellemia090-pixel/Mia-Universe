# 标签安全区与旅游作品双语修复

源项目 `integrated-v2/` → `python task-tools/build-pages-release.py` → `github-pages-v2/`。本轮仅提交本地 main，不推送、不部署。

## 首页标签

根因：Selected Work 的 180px 宽度仍被继承的 max-width:100% 限制到 146px，单行文字碰到 clip-path 锯齿边缘。现在桌面按内容宽度布局、去除这个上限、左右各保留 16px；手机保留两行文字并增加上下安全区。320px 单独控制标签宽度和间距。

发布预览在 320、375、768、1024、1440px、英文与中文各检查一次，缩放均为 1.0。六张标签逐字测量，四边最小字形安全余量为 3.0px；无页面横向溢出。

| 英文宽度 | Selected Work 与 Archive 标签间距 |
| ---: | ---: |
| 320px | 14.0px |
| 375px | 10.6px |
| 768px | 57.2px |
| 1024px | 65.5px |
| 1440px | 159.4px |

标签和人物的弧线锚点、人物、发饰、蓝色背景与云层素材均保留。宽标签仍在头顶之外，见截图。

## 英文正文及交互

旅游页运行代码从 HTML 拆到 `tourism-story.js`；专用词语释义、搜索映射与阅读摘要在 `tourism-i18n.js`。其他作品不载入这些脚本。

本地源与 `/Mia-Universe/` 发布预览，分别在 1440×1000、375×1000 下切换英文和中文：共 440 次状态检查，其中英文 220 次未发现未标注的中文界面文字或属性。检查正文与折叠方法内容、2013–2023 所有年份、2019=100 指数、季度人次/增长率、三个假期的总量/日均、两种主题权重、全年指标、两个城市/双城词云、词云焦点、全部城市/主题/视频筛选、搜索、空结果，以及真正点击语言按钮后的重载。

实际鼠标悬浮折线图：年份切到 2013，说明为 trips 54.3%、nominal spending 45.9%；提示为 `2013: 32.62 (100 million trips)`。季度提示同样有英文单位。币值单位使用 CNY trillion、CNY 100 million，城市人次使用 10,000 visitor trips，原始数据不换算、不改写。

词云原先按小字号排布，但公共样式强制按钮至少 16px，造成部分英文词语溢出。现在按实际最小字号和边距测量；空间不足时使用已有的词频列表，并明确说明以百分比显示频率。最终两版、两宽度、两入口检查，60 个词语全部可访问，未发现文字截短。焦点/悬浮说明保留对应评论数和比例，点击仍使用原始分词索引。

英文关键词与中文原文匹配结果：

| 英文 / 中文输入 | 全文匹配条数 |
| --- | ---: |
| service / 服务 | 65 |
| malatang / 麻辣烫 | 337 |
| promotion / 宣传 | 70 |

词云中的 service 精确匹配为哈尔滨 14 条；这是原分词索引结果，不替换成全文子串的 65 条。手动编辑搜索词才切换为全文搜索。匹配原文可见高亮。

3,624 条评论、11 年数值、词频与索引的 reportData 原文与 9b4e602 完全一致。SHA-256：`b2848ae0ee759679878ffe885eb06296fd05b0d80bd06a2475ed90be6f3b39fc`。

## 英文版仍保留中文原文的位置

| 位置 | 处理方式 |
| --- | --- |
| Read the evidence → 每条评论的 Read original in Chinese | 中文原句折叠保存，默认可见英文阅读帮助。首屏六条有手工撰写的英文阅读摘要；其他评论提供来源/命中词语语境，明确标记“not a full translation”。无命中主题的条目只提供来源语境，不编造立场或全文译文。 |
| 词频/分词规则 → Original Chinese token lists | 保留准确中文停用词，英文说明其技术用途；固定词逐项配英文释义。 |
| 主题方法 → Original keyword tokens and English glosses | 每个中文匹配词旁有对应英文释义。 |
| Read original in Chinese 入口 | 用户主动打开完整中文原文；英文页面本身不混入这份原文。 |
| 下载 CSV / JSON | 保留中文原始评论；英文 CSV 表头标明原文列，界面可见说明下载保留源语言。JSON 保持原始数据与字段。 |
| 页面语言切换按钮 | “中文”作为语言名称保留。 |

并未将 3,624 条原始评论伪装成已完成全文英译；关键词语境不能替代逐句翻译，也不用于判断否定、讽刺、情感或立场。

## 截图

- [桌面首页标签](Mia-Universe-1440-en-home.png)
- [375px 首页标签](Mia-Universe-375-en-home.png)
- [320px 首页标签](Mia-Universe-320-en-home.png)
- [中文首页](Mia-Universe-375-zh-home.png)
- [2013 年说明与英文单位](Mia-Universe-1440-en-recovery-2013.png)
- [手机英文图表](Mia-Universe-375-en-recovery-2013.png)
- [英文搜索与阅读帮助](Mia-Universe-1440-en-search.png)
- [手机英文搜索](Mia-Universe-375-en-search.png)
- [词频显示与英文说明](Mia-Universe-1440-en-cloud.png)

验证记录：validation.json、labels-final.json、final-cloud.json、hover.json。仓库中的 validation / final-cloud 保留各状态的检查摘要，完整扫描记录留在工作区 pages-release-review/followup-label-language/，避免重复收录整页中文文案。静态路径/大小写检查通过，314 条资源路径无错误；JavaScript 语法检查通过。
