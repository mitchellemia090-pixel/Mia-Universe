from pathlib import Path
import json,subprocess,urllib.request
root=Path('github-pages-v2');source=Path('integrated-v2');origin='http://127.0.0.1:8782/Mia-Universe/'
result=[]
for p in sorted(source.glob('source-media/web/*.mp4')):
 rel=p.relative_to(source).as_posix();target=root/rel
 request=urllib.request.Request(origin+rel,headers={'Range':'bytes=0-1023'})
 with urllib.request.urlopen(request) as response:status=response.status;size=len(response.read());content_range=response.headers.get('Content-Range')
 tracked=subprocess.run(['git','-C',str(root),'ls-files','--error-unmatch',rel],capture_output=True).returncode==0
 result.append(dict(path=rel,source=True,release=target.exists(),tracked=tracked,bytes=target.stat().st_size,status=status,range=content_range,readBytes=size))
Path('pages-release-review/fix-20261112/media-requests.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
