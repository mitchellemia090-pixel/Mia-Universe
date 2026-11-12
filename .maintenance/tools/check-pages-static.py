import collections
from html.parser import HTMLParser
import json
from pathlib import Path
import posixpath
import re
from urllib.parse import unquote,urljoin,urlsplit

root=Path('github-pages-v2')
repo='/Mia-Universe/'
files={p.relative_to(root).as_posix():p for p in root.rglob('*') if p.is_file() and not any(x.startswith('.') for x in p.relative_to(root).parts)}
folded={k.casefold():k for k in files}
assert len(folded)==len(files),'case-colliding files'
checked=set()
issues=set()
pattern=re.compile(r"""url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)""",re.I)

class Tags(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.base=None
  self.links=[]
  self.styles=[]
  self.style=False
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag=='base':self.base=attrs.get('href')
  else:
   for attr in ('href','src','poster','action','data-public-src'):
    value=attrs.get(attr)
    if value and attr!='data-public-src':self.links.append(value)
   if attrs.get('style'):self.styles.append(attrs['style'])
  if tag=='style':self.style=True
 def handle_endtag(self,tag):
  if tag=='style':self.style=False
 def handle_data(self,data):
  if self.style:self.styles.append(data)

def inspect(ref,base,owner):
 if not ref or ref.startswith(('#','data:','blob:','mailto:','tel:','javascript:','about:')) or '${' in ref:return
 if re.search(r'localhost|127\.0\.0\.1|file:///|^[a-z]:[\\/]',ref,re.I):
  issues.add((owner,ref[:160],'local only'))
  return
 parsed=urlsplit(urljoin(base,ref))
 if parsed.netloc:return
 target=unquote(parsed.path)
 if not target.startswith(repo):
  issues.add((owner,ref[:160],'escapes repository prefix'))
  return
 key=target[len(repo):] or 'index.html'
 checked.add(key)
 if key not in files:
  issues.add((owner,ref[:160],f'case: {folded[key.casefold()]}' if key.casefold() in folded else f'missing: {key}'))

def css(s,base,owner):
 for match in pattern.finditer(s):
  inspect(next(v for v in match.groups() if v is not None),base,owner)

def markup(s,base,owner):
 parser=Tags();parser.feed(s)
 if parser.base:base=urljoin(base,parser.base)
 for ref in parser.links:inspect(ref,base,owner)
 for style in parser.styles:css(style,base,owner)

for key,p in files.items():
 base=repo+key
 if p.suffix=='.html':markup(p.read_text(encoding='utf8'),base,key)
 if p.suffix=='.css':css(p.read_text(encoding='utf8'),base,key)
 if key.startswith('works-content/') and p.suffix=='.json':
  data=json.loads(p.read_text(encoding='utf8'))
  for lang in ('en','zh'):
   if lang in data:markup(data[lang]['html'],repo+'projects/reader.html',key+' '+lang)
  for a in data.get('attachments',[]):inspect(a['href'],repo+'index.html',key)
 if p.suffix in ('.html','.css','.js','.json'):
  s=p.read_text(encoding='utf8')
  if re.search(r'-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}|sk-(?:proj-)?[A-Za-z0-9_-]{30,}',s):
   issues.add((key,'credential-like string','needs manual review'))
report={'checkedPaths':len(checked),'issues':[list(i) for i in sorted(issues)]}
Path('pages-release-review/static-check.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps(report,indent=2))
raise SystemExit(bool(issues))
