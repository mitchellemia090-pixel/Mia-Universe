"""Keep full-resolution originals; create portable H.264/AAC web renditions."""
from pathlib import Path
import subprocess,json
root=Path('integrated-v2/source-media'); web=root/'web';web.mkdir(exist_ok=True)
ffmpeg=Path('D:/JianyingPro/8.9.0.13361/ffmpeg.exe')
report=[]
for name in ('barber','broadcast','haidilao','zine-report'):
 src=root/(name+'.mp4');dst=web/src.name
 if not dst.exists():
  subprocess.run([str(ffmpeg),'-hide_banner','-loglevel','error','-y','-i',str(src),'-map','0:v:0','-map','0:a:0?','-vf','scale=1280:-2','-c:v','h264_qsv','-b:v','1300k','-maxrate','1800k','-bufsize','3600k','-pix_fmt','nv12','-c:a','aac','-b:a','128k','-movflags','+faststart',str(dst)],check=True)
 report.append(dict(file=src.name,original=src.stat().st_size,web=dst.stat().st_size))
 print(report[-1],flush=True)
Path('pages-release-review/fix-20261112/video-encoding.json').write_text(json.dumps(report,indent=2))
