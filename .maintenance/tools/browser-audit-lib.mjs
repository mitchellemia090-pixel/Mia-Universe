import fs from 'node:fs';
import {spawn} from 'node:child_process';
export const wait=ms=>new Promise(r=>setTimeout(r,ms));
export class Browser {
 async start(){
  this.child=spawn(process.env.LOCALAPPDATA+'/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe',['--no-sandbox','--disable-gpu','--remote-debugging-port=0','--user-data-dir='+process.cwd()+'/task-tools/audit-browser-'+Date.now(),'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let log='';const port=await new Promise((resolve,reject)=>{this.child.on('error',reject);this.child.stderr.on('data',b=>{log+=b;const m=log.match(/DevTools listening on ws:\/\/127.0.0.1:(\d+)/);if(m)resolve(m[1])});setTimeout(()=>reject(Error(log)),15000)});
  const tabs=await(await fetch('http://127.0.0.1:'+port+'/json')).json();this.ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>this.ws.onopen=r);this.id=0;this.pending=new Map();
  this.ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=this.pending.get(m.id);this.pending.delete(m.id);if(p)m.error?p.reject(Error(m.error.message)):p.resolve(m.result)}};
  await this.call('Page.enable');await this.call('Runtime.enable');await this.call('Network.enable');await this.call('Network.setCacheDisabled',{cacheDisabled:true});
 }
 call(method,params={}){return new Promise((resolve,reject)=>{const id=++this.id;this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{if(this.pending.delete(id))reject(Error(method+' timeout'))},30000)})}
 async ev(expression){const r=await this.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
 async size(width,height=900){await this.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await this.call('Emulation.setPageScaleFactor',{pageScaleFactor:1})}
 async go(url,delay=1800){await this.call('Page.navigate',{url});await wait(delay)}
 async shot(path){const r=await this.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path,Buffer.from(r.data,'base64'))}
 stop(){this.ws?.close();this.child?.kill()}
}
