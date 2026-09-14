const CACHE='inside-gpt-v6';
const ASSETS=['/','/index.html','/responsive.css','/manifest.webmanifest','/icon.svg','/art-1.webp','/art-2.webp','/art-3.webp','/art-4.webp'];
const injectResponsive=async response=>{
  if(!response)return response;
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html'))return response;
  const text=await response.text();
  const linked=text.includes('/responsive.css')?text:text.replace('</head>','<link rel="stylesheet" href="/responsive.css?v=6"></head>');
  const headers=new Headers(response.headers);
  headers.delete('content-length');
  return new Response(linked,{status:response.status,statusText:response.statusText,headers});
};
self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:'window'});
  await Promise.all(clients.map(client=>client.navigate(client.url).catch(()=>{})));
})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const network=await fetch(event.request,{cache:'no-store'});
        const clone=network.clone();
        caches.open(CACHE).then(cache=>cache.put('/index.html',clone)).catch(()=>{});
        return injectResponsive(network);
      }catch(error){
        return injectResponsive(await caches.match('/index.html'));
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    const network=await fetch(event.request);
    const clone=network.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,clone)).catch(()=>{});
    return network;
  })());
});
