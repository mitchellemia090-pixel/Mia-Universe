/* Read local editions over HTTP and when the local HTML entry is opened directly. */
window.MIA_FETCH_WORK=async function(id,base){
 if(location.protocol!=='file:'){
  const response=await fetch(new URL('works-content/'+encodeURIComponent(id)+'.json',base));
  if(!response.ok)throw Error('Missing work: '+id);
  return response.json();
 }
 if(window.MIA_WORKS?.[id])return window.MIA_WORKS[id];
 await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('works-content/'+encodeURIComponent(id)+'.js',base);script.onload=resolve;script.onerror=()=>reject(Error('Missing work: '+id));document.head.append(script)});
 if(!window.MIA_WORKS?.[id])throw Error('Missing work: '+id);
 return window.MIA_WORKS[id];
};
