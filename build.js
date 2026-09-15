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
  html = html.replace('</head>', '<link rel="stylesheet" href="/mobile-v2.css?v=11">\n<link rel="stylesheet" href="/polish-v3.css?v=11">\n</head>');
} else if (!html.includes('/polish-v3.css')) {
  html = html.replace('</head>', '<link rel="stylesheet" href="/polish-v3.css?v=11">\n</head>');
}
if (!html.includes('/mobile-v2.js')) {
  html = html.replace('</body>', '<script src="/mobile-v2.js?v=11" defer></script>\n</body>');
}

// Keep the participant assessment outside the four-act GPT learning sequence.
// It appears only after the story has finished and opens as a separate page.
const day1Entry = `
<aside aria-label="Day 1 knowledge check" style="padding:0 clamp(16px,6vw,72px) 56px">
  <div class="wrap">
    <div class="card" style="background:#0B1B3A;color:#fff;overflow:hidden">
      <div style="font-size:11px;font-weight:950;letter-spacing:.14em;text-transform:uppercase;opacity:.65;margin-bottom:10px">Optional · End of Day 1</div>
      <h2 style="font-size:clamp(34px,5vw,58px);margin-bottom:12px">Check what actually stuck.</h2>
      <p style="max-width:760px;font-size:17px;line-height:1.5;color:rgba(255,255,255,.76)">A separate 18-question knowledge check covering today’s full course content. Fixed order, immediate explanations, topic-by-topic results, and unlimited retakes.</p>
      <a href="/day1-check" class="btn" style="margin-top:8px;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;background:#FFD46A;color:#0B1B3A;min-height:50px">Open Day 1 knowledge check</a>
    </div>
  </div>
</aside>`;
if (!html.includes('Open Day 1 knowledge check')) {
  html = html.replace('</main>', '</main>' + day1Entry);
}

if (html.includes('\\n')) throw new Error('Build still contains literal \\n sequences');
fs.writeFileSync(path.join(out, 'index.html'), html);

for (const file of ['mobile-v2.css','polish-v3.css','mobile-v2.js','manifest.webmanifest','icon.svg','art-1.webp','art-2.webp','art-3.webp','art-4.webp','day1-check.html']) {
  fs.copyFileSync(path.join(root, file), path.join(out, file));
}

// Network-first navigation prevents stale classroom pages after production pushes.
// Each navigation is cached under its own request so the quiz never overwrites the home fallback.
const sw = `const CACHE='inside-gpt-v11';
const ASSETS=['/','/index.html','/day1-check','/day1-check.html','/mobile-v2.css?v=11','/polish-v3.css?v=11','/mobile-v2.js?v=11','/manifest.webmanifest','/icon.svg','/art-1.webp','/art-2.webp','/art-3.webp','/art-4.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/index.html'))));return;}e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const z=r.clone();caches.open(CACHE).then(x=>x.put(e.request,z));return r})));});`;
fs.writeFileSync(path.join(out, 'sw.js'), sw);

console.log('Built responsive classroom site with separate Day 1 knowledge check.');
