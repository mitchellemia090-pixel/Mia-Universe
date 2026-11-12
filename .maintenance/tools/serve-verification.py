"""Case-sensitive /Mia-Universe/ preview with byte-range video support."""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import urlsplit,unquote
import re
workspace=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  path=unquote(urlsplit(self.path).path)
  prefix='/Mia-Universe/' if path.startswith('/Mia-Universe/') else '/local/'
  root=workspace/('github-pages-v2' if prefix=='/Mia-Universe/' else 'integrated-v2')
  key=path.removeprefix(prefix) or 'index.html'
  if '..' in Path(key).parts or not path.startswith(prefix):self.send_error(404);return
  p=root
  for part in Path(key).parts:
   if not p.is_dir() or part not in {x.name for x in p.iterdir()}:self.send_error(404);return
   p=p/part
  if not p.is_file():self.send_error(404);return
  size=p.stat().st_size;start=0;end=size-1
  if self.headers.get('Range'):
   m=re.fullmatch(r'bytes=(\d+)-(\d*)',self.headers['Range'])
   if not m:self.send_error(416);return
   start=int(m[1]);end=min(int(m[2]) if m[2] else end,end)
   if start>end:self.send_error(416);return
   self.send_response(206);self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
  else:self.send_response(200)
  self.send_header('Content-Type',self.guess_type(str(p)));self.send_header('Content-Length',str(end-start+1));self.send_header('Accept-Ranges','bytes');self.send_header('Cache-Control','no-store');self.end_headers()
  try:
   with p.open('rb') as f:
    f.seek(start);remaining=end-start+1
    while remaining:
     chunk=f.read(min(262144,remaining))
     if not chunk:break
     self.wfile.write(chunk);remaining-=len(chunk)
  except (ConnectionAbortedError,ConnectionResetError,BrokenPipeError):pass
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',8782),Handler).serve_forever()
