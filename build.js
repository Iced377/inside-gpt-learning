const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// Repair accidental literal "\\n" sequences from an earlier patch. Those broke
// .hero-art and the opening of the phone media query, causing overlap/truncation.
html = html.replace(/\\n/g, '\n');

// Remove the old emergency overflow-hiding patch. The production stylesheets below
// perform real mobile reflow instead of simply clipping anything outside the viewport.
html = html.replace(/\n\/\* Responsive containment hardening \*\/[\s\S]*?\n(?=<\/style>)/, '\n');

// Let mobile-v2.css own motion accessibility behavior.
html = html.replace(/@media\(prefers-reduced-motion:reduce\)\{\*\{scroll-behavior:auto!important;transition:none!important;animation:none!important\}\}\s*/g, '');

// CSS and motion JS must be present on the FIRST navigation. Do not depend on a
// service worker to modify HTML after it has already loaded.
if (!html.includes('/mobile-v2.css')) {
  html = html.replace('</head>', '<link rel="stylesheet" href="/mobile-v2.css?v=10">\n<link rel="stylesheet" href="/polish-v3.css?v=10">\n</head>');
} else if (!html.includes('/polish-v3.css')) {
  html = html.replace('</head>', '<link rel="stylesheet" href="/polish-v3.css?v=10">\n</head>');
}
if (!html.includes('/mobile-v2.js')) {
  html = html.replace('</body>', '<script src="/mobile-v2.js?v=10" defer></script>\n</body>');
}

if (html.includes('\\n')) throw new Error('Build still contains literal \\n sequences');
fs.writeFileSync(path.join(out, 'index.html'), html);

for (const file of ['mobile-v2.css','polish-v3.css','mobile-v2.js','manifest.webmanifest','icon.svg','art-1.webp','art-2.webp','art-3.webp','art-4.webp']) {
  fs.copyFileSync(path.join(root, file), path.join(out, file));
}

// Network-first navigation prevents a stale classroom page after a new production push.
const sw = `const CACHE='inside-gpt-v10';
const ASSETS=['/','/index.html','/mobile-v2.css?v=10','/polish-v3.css?v=10','/mobile-v2.js?v=10','/manifest.webmanifest','/icon.svg','/art-1.webp','/art-2.webp','/art-3.webp','/art-4.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put('/index.html',c));return r}).catch(()=>caches.match('/index.html')));return;}e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const z=r.clone();caches.open(CACHE).then(x=>x.put(e.request,z));return r})));});`;
fs.writeFileSync(path.join(out, 'sw.js'), sw);

console.log('Built responsive classroom site in dist/');
