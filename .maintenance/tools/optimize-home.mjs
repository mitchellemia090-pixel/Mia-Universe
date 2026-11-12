// Rasterize the approved SVG filters/crops in Chromium before encoding WebP.
import fs from 'node:fs';import {Browser} from './browser-audit-lib.mjs';
const b=new Browser();await b.start();try{await b.go('http://127.0.0.1:8782/local/');
const paths=['home','about','work','archive','personal','contact'].map(n=>'assets/'+n+'.svg').concat(['approved-rest','cloud-volume-proportions','cloud-floor-layout'].map(n=>'assets/home-refinement/'+n+'.svg'));
for(const path of paths){const result=await b.ev(`(async()=>{const path=${JSON.stringify(path)},xml=await(await fetch(path)).text(),v=xml.match(/viewBox="([^"]+)"/)[1].split(/\\s+/).map(Number),w=path.includes('home-refinement')?v[2]:Math.round(360),h=Math.round(w*v[3]/v[2]),im=new Image();im.src=path;await im.decode();const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);return {data:c.toDataURL('image/png').split(',')[1],width:w,height:h}})()`);fs.writeFileSync('integrated-v2/'+path.replace('.svg','.png'),Buffer.from(result.data,'base64'));console.log(path,result.width,result.height)}
}finally{b.stop()}
