(() => {
  const nodes=[...document.querySelectorAll('.acthead,.section-title,.challenge,.transformer-shell,.handoff-demo,.microscope,.train-grid,.selfsup,.scale-wrap,.scalequiz,.post-grid,.rlhf,.inference,.map,.taxonomy,.memory')];
  const reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced || !('IntersectionObserver' in window)) return;
  nodes.forEach(n=>n.classList.add('scroll-reveal'));
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('in-view');io.unobserve(entry.target)}
    });
  },{rootMargin:'0px 0px -8% 0px',threshold:.08});
  nodes.forEach(n=>io.observe(n));
})();
