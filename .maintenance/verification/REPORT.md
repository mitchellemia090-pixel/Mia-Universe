# 2026-11-12 修复及浏览器验证

维护源：`integrated-v2/`；发布副本及 Git 仓库：`github-pages-v2/`。本轮不 push、不部署。

## 首屏：禁用缓存，100% 缩放

下表为本机浏览器实际 HTTP 请求，不是线上速度。修复前预览与修复后预览使用本机服务；服务实现和测量批次不同，不能把时差直接视为 CDN 提速比例。可靠的主要改进是文件传输量大幅下降。线上地址在当前浏览器返回网络错误，无法测量真实线上请求。

| 图像 | 原文件 bytes | 原请求 ms | 新文件 bytes | 新请求 ms |
| --- | ---: | ---: | ---: | ---: |
| home | 3,368,628 | 175 | 15,094 | 88 |
| about | 3,368,627 | 28 | 16,200 | 27 |
| work | 3,368,629 | 176 | 17,836 | 89 |
| archive | 3,368,628 | 797 | 18,256 | 89 |
| personal | 3,368,629 | 179 | 19,834 | 91 |
| contact | 3,368,629 | 178 | 14,012 | 50 |
| approved-rest | 3,380,473 | 47 | 113,194 | 72 |
| cloud-volume-proportions | 3,359,225 | 784 | 52,660 | 80 |
| cloud-floor-layout | 3,359,239 | 167 | 22,642 | 60 |

六图标合计从 20,211,770 bytes 降至 101,232 bytes。人物 113,194 bytes；实际使用的云层与底图合计 75,302 bytes。保留透明通道，使用原 SVG 裁切及滤镜的浏览器栅格化结果，无人物生成或重绘。

移除隐藏侧云请求，隐藏导航图片使用 lazy；首屏图标设置 high priority。最终复测没有重复预加载请求；首页不请求视频，阅读页非首屏图片 lazy、视频 preload=none。

首页本地源和发布副本分别测试 375、768、1000、1440、1920px 宽，六图标全部加载成功，无页面横向溢出。桌面使用更宽的椭圆弧与较小图标，Selected Work / Archive 上移、Personal Space 外移，人物、发饰与云层比例保留。截图见同目录 *home*after.png。

## 作品布局与实际操作

从 Selected Work 点击和直接打开 Someone took a screenshot 均已测试，作品集入口是整页跳转，没有外层预览 iframe。页面自身的 .hero.wrap 去掉了左右留白，双栏使用自动最小尺寸，导航 .links / .navlinks 强制单行，导致内容挤压或只能横滑。修复增加可收缩轨道 minmax(0,...)、网格项 min-width:0、正文留白及可换行导航，1000px 以下转为单栏。

1440 / 1000 / 768 / 375px、默认缩放 1.0：两种入口均无正文或按钮裁切。额外在 812×375 横屏、1440×900 和 375×900 使用真实鼠标输入点击作品卡、截图通知按钮和英文阅读按钮，命中目标成功，Escape 可关闭阅读对话框。

其他入口：39 个作品页面分别在桌面和手机打开；无损坏图片或阅读器数据错误。Read Together 的两条 light-line 为插画内部装饰，父 .hero-art overflow:hidden，页面 scrollWidth=360 <= 375，未裁切正文或操作控件。表格保留容器内横向滚动，不强行压缩表格。旅游作品的 ResizeObserver 改为仅宽度变化时重绘，避免内容高度变化触发不必要重绘。

## 视频和 zine

旧发布脚本排除全部 MP4，并将链接改成 .mp4.html 状态页、隐藏 video。四份原片均存在，路径大小写一致。本轮生成 H.264/AAC、fast start 网页版本并以相对路径支持 /Mia-Universe/；新增海底捞正文播放器。

| 实际打开页面 | 视频 | 网页 bytes | 播放 / 跳至 10 秒后继续 |
| --- | --- | ---: | --- |
| reading-zine.html | zine-report.mp4 | 19,628,886 | 1.18s → 10.99s；已解码 315 帧 |
| reading-barber.html | barber.mp4 | 31,569,495 | 1.16s → 11.37s；已解码 130 帧 |
| reading-broadcast.html | broadcast.mp4 | 39,515,750 | 1.17s → 11.31s；已解码 247 帧 |
| source-haidilao.html | haidilao.mp4 | 78,287,268 | 1.17s → 11.34s；已解码 129 帧 |
| Zine_Ideas_in_Motion.html | zine-report.mp4 | 19,628,886 | 1.17s → 10.97s；已解码 311 帧 |

以上五个入口均为页面中真实播放器，没有临时注入播放器。四个 MP4 都已进入发布目录并被 Git 跟踪；请求返回 206，字节范围和 Content-Range 正确。原片合计约 1.39 GB，网页版本合计 169.001 MB（准确 bytes 见 video-encoding.json）。所有测试为静音自动化播放；解码、画面、时长及跳转已验证，没有进行主观音质试听或逐秒看完整片。

## 仍未进入发布目录的材料

本轮范围内的 zine 和四份视频无剩余缺失。以下原始文档沿用原发布边界，保留本地完整版，不把“状态页 HTTP 200”当成原文件存在。摄影封面学号处理、社交营销原始访谈附录的排除均保留。网页阅读正文照常可用。

| 本地原文件 | bytes | 发布状态 |
| --- | ---: | --- |
| source-originals/ai-short-videos.pdf | 2,531,571 | 本地存在；公开入口为状态说明 |
| source-originals/ai-society.pdf | 545,517 | 本地存在；公开入口为状态说明 |
| source-originals/barbie.pdf | 12,749,408 | 本地存在；公开入口为状态说明 |
| source-originals/bollywood.docx | 678,898 | 本地存在；公开入口为状态说明 |
| source-originals/breaking-the-trap.pdf | 644,805 | 本地存在；公开入口为状态说明 |
| source-originals/budgets.docx | 478,148 | 本地存在；公开入口为状态说明 |
| source-originals/ceremonie-course-version.pdf | 621,300 | 本地存在；公开入口为状态说明 |
| source-originals/commentary-1.docx | 18,202 | 本地存在；公开入口为状态说明 |
| source-originals/commentary-2.docx | 14,378 | 本地存在；公开入口为状态说明 |
| source-originals/commentary-3.docx | 14,301 | 本地存在；公开入口为状态说明 |
| source-originals/commentary-4.docx | 16,745 | 本地存在；公开入口为状态说明 |
| source-originals/copyright.docx | 9,079,393 | 本地存在；公开入口为状态说明 |
| source-originals/data-mining-group.pdf | 4,893,465 | 本地存在；公开入口为状态说明 |
| source-originals/digital-news.doc | 218,868 | 本地存在；公开入口为状态说明 |
| source-originals/fair.docx | 706,535 | 本地存在；公开入口为状态说明 |
| source-originals/governance.docx | 210,507 | 本地存在；公开入口为状态说明 |
| source-originals/governance.pptx | 215,824,377 | 本地存在；公开入口为状态说明 |
| source-originals/haidilao.docx | 4,282,284 | 本地存在；公开入口为状态说明 |
| source-originals/motion.docx | 14,131 | 本地存在；公开入口为状态说明 |
| source-originals/oscars-workbook.twbx | 321,461 | 本地存在；公开入口为状态说明 |
| source-originals/photography-analysis.docx | 6,090,207 | 本地存在；公开入口为状态说明 |
| source-originals/photography-assignment1.pdf | 905,502 | 本地存在；公开入口为状态说明 |
| source-originals/photography-campus.docx | 13,219 | 本地存在；公开入口为状态说明 |
| source-originals/photography.pdf | 111,470,794 | 本地存在；公开入口为状态说明 |
| source-originals/public-figures.pdf | 559,933 | 本地存在；公开入口为状态说明 |
| source-originals/romance-defence.pdf | 292,617 | 本地存在；公开入口为状态说明 |
| source-originals/romance-thesis.pdf | 801,895 | 本地存在；公开入口为状态说明 |
| source-originals/rumours.docx | 317,447 | 本地存在；公开入口为状态说明 |
| source-originals/screenshot-thesis.pdf | 2,589,281 | 本地存在；公开入口为状态说明 |
| source-originals/self-method.docx | 17,446 | 本地存在；公开入口为状态说明 |
| source-originals/social-marketing.pdf | 1,377,412 | 本地存在；公开入口为状态说明 |

其中 governance.pptx (215,824,377 bytes) 与 photography.pdf (111,470,794 bytes) 还超出普通 GitHub 单文件限制；其余原文档并非文件缺失，而是既有发布范围外的附件。未发现丢失原视频。

## 生成与发布流程

完整说明见仓库根目录 PUBLISHING.md，或源目录 RELEASE-WORKFLOW.md。工作区运行 python task-tools/build-pages-release.py 同步发布目录；python task-tools/serve-verification.py 提供 /local/ 和 /Mia-Universe/ 两个入口。生成脚本不会推送、部署，保留 .git。构建脚本、源代码快照、已审核封面覆盖文件及验证数据收录在仓库 .maintenance/。

GitHub 连接器确认远端 main 为 6c5aead190b285bb5e62b75f1f2c33b6cb176eef，与修改前本地发布副本一致，仓库 has_pages=true。无法读取 Pages 的分支设置，不能宣称已核实 Settings 中 main / root 配置；发布时仍需核对。线上 HTTP、真实线上首屏耗时与新视频线上播放尚未验证。
