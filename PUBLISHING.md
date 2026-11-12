# 本地完整版与 GitHub Pages

维护源是 `integrated-v2/`，发布副本是同级 `github-pages-v2/`。Git 仓库在发布副本内部，分支为 `main`；工作区根目录不是 Git 仓库。

在 `Personal-Universe` 根目录运行：

```powershell
python task-tools/build-pages-release.py
python task-tools/serve-verification.py
```

打开 `http://127.0.0.1:8782/local/` 查看完整版，打开 `http://127.0.0.1:8782/Mia-Universe/` 查看发布副本。此服务严格匹配大小写，支持视频 Range 请求，并禁用缓存。不要同时启动多个 8782 服务。

生成脚本复制网页运行文件、网页视频和字幕。它保留摄影封面已审核的公开处理，并排除社交营销原始访谈附录；原始文档仍保留本地，公开入口说明其状态。不要使用 `build-integrated-v1.py` 重建 V2，它会覆盖后续修改。

`source-media/*.mp4` 是原片；播放器使用 `source-media/web/*.mp4`，为 H.264/AAC、约 1280px 宽、fast start 的网页版本。播放器 `preload="none"`，点击播放才请求视频。新增或替换原片后，删除对应旧网页版本，再运行 `python task-tools/prepare-web-media.py`；编码器路径见该脚本。无需重新编码未修改的视频。

首页 WebP 从已确认 SVG 的裁切、滤镜结果导出；原 SVG 保留用于后续处理。只改代码或位置时不必重新生成图片。

```powershell
python task-tools/check-pages-static.py
node task-tools/audit-after.mjs
node task-tools/audit-playback.mjs
git -C github-pages-v2 status --short
```

浏览器验证依赖本机 Playwright 的 Chromium headless shell；在默认 100% 缩放下测试。报告在 `pages-release-review/fix-20261112/`。测试脚本不会发布网站。

生成脚本也将本轮修改的源代码快照、经过审核的封面覆盖文件及生成脚本存入仓库 `.maintenance/`，便于恢复。完整源项目和原视频仍保存在仓库外的 `integrated-v2/`。仅有发布仓库时，先恢复完整本地源，再将 `.maintenance/source-changes/` 合并回源目录；不要把这个局部快照当成独立网站运行。

远端仓库为 `mitchellemia090-pixel/Mia-Universe`。2026-11-12 读取远端确认 Pages 已启用，远端 `main` 仍是 `6c5aead190b285bb5e62b75f1f2c33b6cb176eef`，与本轮修改前的发布副本一致。现有工具无法读取 Pages 设置中的具体发布分支；部署时应检查 Settings → Pages 是否使用 `main` / `/(root)`，若使用 Actions 则确认其上传的是仓库根目录。

本轮只提交本地 `main`，不 push、不部署。经用户另行要求后，才推送并检查线上 Pages 构建和真实网络加载。
