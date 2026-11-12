"""Generate Pages from integrated-v2. Never deploy or push. Run from workspace."""
from pathlib import Path
import hashlib,json,shutil,re,subprocess
workspace=Path(__file__).resolve().parents[1]
if workspace.name=='github-pages-v2':workspace=workspace.parent
source=workspace/'integrated-v2';site=workspace/'github-pages-v2'
audit=workspace/'pages-release-review/fix-20261112';audit.mkdir(parents=True,exist_ok=True)
runtime={'assets','about-assets','archive-assets','contact-assets','personal-space-assets','projects','selected-work-assets','works-assets','works-content'}
allowed={'.html','.css','.js','.json','.svg','.png','.webp','.jpg','.jpeg','.woff','.woff2','.otf','.ttf','.vtt'}
exclude={'assets/home-refinement/angle-reference.png','assets/home-refinement/approved-home.png','assets/home-refinement/portrait-reference.png'}
exclude.update({'assets/home-refinement/asset-notes.json','assets/home-refinement/cloud-source-audit.json','assets/home-refinement/cloud-proportions-notes.json','assets/home-refinement/cloud-profile-proportions.json','about-assets/original-pixel-verification.json','contact-assets/asset-verification.json','personal-space-assets/portrait-verification.json','assets/gaze/alignment.json','assets/mia-heads/alignment.json'})
rasters=['assets/'+n for n in ('home','about','work','archive','personal','contact')]+['assets/home-refinement/'+n for n in ('approved-rest','cloud-volume-proportions','cloud-floor-layout')]
exclude.update(n+'.png' for n in rasters)
copied=[];held=[]
# Retain previously reviewed photography cover rendering across regeneration.
preserved={};overrides=workspace/'task-tools/publish-overrides'
if not overrides.exists() and (Path(__file__).parent/'publish-overrides').exists():overrides=Path(__file__).parent/'publish-overrides'
for rel in ('projects/photojournalism/data.js','projects/photojournalism/booklet.js'):
 stored=overrides/rel
 if stored.exists():preserved[rel]=stored.read_bytes()
 else:
  previous=subprocess.run(['git','-C',str(site),'show','HEAD:'+rel],capture_output=True)
  if previous.returncode==0:
   preserved[rel]=previous.stdout;stored.parent.mkdir(parents=True,exist_ok=True);stored.write_bytes(previous.stdout)
for p in source.rglob('*'):
 if not p.is_file():continue
 rel=p.relative_to(source).as_posix();root=rel.split('/')[0]
 use=(p.parent==source and (p.name=='index.html' or p.suffix in {'.css','.js'})) or (root in runtime and p.suffix.lower() in allowed and rel not in exclude and rel!='projects/photojournalism/assets/original-01.webp') or rel=='source-originals/tourism.html' or (root=='source-media' and (p.suffix=='.vtt' or '/web/' in rel))
 if not use:continue
 if p.stat().st_size>=100_000_000:
  held.append({'path':rel,'bytes':p.stat().st_size,'reason':'original retained locally; too large for ordinary GitHub upload'});continue
 target=site/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target);copied.append(rel)
for folder in ('source-media','source-originals','source-review'):
 for p in (site/folder).rglob('*'):
  if p.is_file() and p.name.endswith(('.mp4.html','.pdf.html','.doc.html','.docx.html','.pptx.html','.twbx.html')):p.unlink()
for name in ('public-media-config.js','public-video.js'):
 p=site/name
 if p.exists():p.unlink()
for rel in rasters:
 p=site/(rel+'.png')
 if p.exists():p.unlink()
for rel in exclude:
 p=site/rel
 if p.exists() and p.is_file():p.unlink()
# Preserve the original publication boundary for binary document attachments.
held=[{'path':p.relative_to(source).as_posix(),'bytes':p.stat().st_size,'reason':'original document remains in local full edition; not part of this media repair'} for p in (source/'source-originals').glob('*') if p.suffix in {'.pdf','.doc','.docx','.pptx','.twbx'}]
for item in held:
 p=site/item['path']
 if p.exists():p.unlink()
for p in (site/'source-originals').rglob('*'):
 if p.is_file() and p.suffix!='.html':p.unlink()
for p in (site/'source-originals').glob('*.html'):
 if p.name!='tourism.html' and not any(p.name.endswith(ext+'.html') for ext in ('.pdf','.doc','.docx','.pptx','.twbx')):p.unlink()
for rel,data in preserved.items():(site/rel).write_bytes(data)
p=site/'projects/photojournalism/assets/original-01.webp'
if p.exists():p.unlink()
# The social-marketing public edition ends before the raw interview appendix.
for suffix in ('.json',):
 p=site/('works-content/social-marketing'+suffix)
 work=json.loads(p.read_text(encoding='utf8'))
 for lang in ('en','zh'):
  s=work[lang]['html'];marker=re.search(r'<h2\b[^>]*data-source-segment="239"[^>]*>',s)
  if marker:work[lang]['html']=s[:marker.start()]
 p.write_text(json.dumps(work,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
 p.with_suffix('.js').write_text('window.MIA_WORKS=window.MIA_WORKS||{};window.MIA_WORKS["social-marketing"]='+json.dumps(work,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
# Research reader buttons use the existing complete web reading editions.
p=site/'projects/Someone_Took_a_Screenshot.html';s=p.read_text(encoding='utf8')
s=re.sub(r"const chinesePDF='[A-Za-z0-9+/=]+';",'',s)
s=re.sub(r'function getPDF\(\)\{.*?(?=function getEnglish\()',"function getPDF(){return 'reading-screenshot-thesis.html?original=1'}",s,flags=re.S)
s=s.replace("document.querySelector('#download-cn').onclick=function(){this.href=getPDF()};","document.querySelector('#download-cn').removeAttribute('download');document.querySelector('#download-cn').href='../source-originals/screenshot-thesis.pdf.html';")
p.write_text(s,encoding='utf8')
p=site/'projects/Beyond_Scripted_Romance.html';s=p.read_text(encoding='utf8')
s=re.sub(r'download="[^"]*" href="data:application/pdf;base64,[A-Za-z0-9+/=]+"','href="../source-originals/romance-thesis.pdf.html"',s)
s=re.sub(r'function getPDF\(\)\{.*?(?=document\.querySelector\(\x27#open-pdf)',"function getPDF(){return 'reading-romance-thesis.html'}",s,flags=re.S)
s=s.replace("document.querySelector('#download-pdf').onclick=function(){this.href=getPDF()};",'')
p.write_text(s,encoding='utf8')
for item in held:
 rel=item['path'];target=site/(rel+'.html')
 target.write_text('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Local original attachment</title><h1>Original attachment</h1><p>'+rel+'</p><p>This original remains in the local full edition. The web reading edition is available from the work page.</p><p lang="zh">原文件保留在本地完整版，请返回作品页阅读网页版。</p><a href="../index.html#/archive">Return to Archive</a>',encoding='utf8')
 for p in site.rglob('*'):
  if '.maintenance' in p.parts or p.suffix not in {'.html','.js','.json'} or p==target:continue
  s=p.read_text(encoding='utf8')
  updated=s.replace(rel+'"',rel+'.html"').replace(rel+"'",rel+".html'").replace(rel+'\\"',rel+'.html\\"')
  if updated!=s:p.write_text(updated,encoding='utf8')
(site/'.nojekyll').touch()
maintenance=site/'.maintenance';maintenance.mkdir(exist_ok=True)
if Path(__file__).resolve()!=(maintenance/'build-pages-release.py').resolve():shutil.copy2(Path(__file__),maintenance/'build-pages-release.py')
if overrides.exists() and overrides.resolve()!=(maintenance/'publish-overrides').resolve():shutil.copytree(overrides,maintenance/'publish-overrides',dirs_exist_ok=True)
snapshots=[]
for p in source.rglob('*'):
 if not p.is_file() or p.suffix not in {'.html','.css','.js','.json','.webp'}:continue
 rel=p.relative_to(source).as_posix()
 if (p.parent==source and p.name in {'index.html','app.js','navigation.js','universe.css','layout-repair.css','reading-layout.css','work-reader.js'}) or rel in {'projects/When_a_City_Goes_Viral.html','projects/Zine_Ideas_in_Motion.html'} or (rel.startswith('works-content/') and p.suffix in {'.js','.json'} and 'source-media/web/' in p.read_text(encoding='utf8')) or (p.suffix=='.webp' and (p.parent==source/'assets' or p.parent==source/'assets/home-refinement')):
  target=maintenance/'source-changes'/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target);snapshots.append(rel)
report={'source':'integrated-v2','release':'github-pages-v2','copied':len(copied),'held':held,'sourceSnapshots':snapshots,'media':[]}
for p in source.glob('source-media/web/*.mp4'):
 rel=p.relative_to(source).as_posix();target=site/rel
 digest=hashlib.sha256(p.read_bytes()).hexdigest()
 report['media'].append({'path':rel,'bytes':p.stat().st_size,'sha256':digest,'copied':target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()==digest})
(audit/'build.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
print(json.dumps({k:report[k] for k in ('copied','held','media')},ensure_ascii=False,indent=2))
