const cards = document.querySelectorAll('.art-card');
const lightbox = document.getElementById('lightbox');
const image = document.getElementById('lightboxImage');
const title = document.getElementById('lightboxTitle');
const closeBtn = document.getElementById('closeLightbox');
const backdrop = lightbox.querySelector('.lightbox-backdrop');

function closeLightbox(){
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

cards.forEach(card => card.addEventListener('click', () => {
  image.src = card.dataset.img;
  image.alt = card.dataset.title;
  title.textContent = card.dataset.title;
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}));

closeBtn.addEventListener('click', closeLightbox);
backdrop.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeLightbox(); });

// Elegant mouse parallax: tiny ornaments drift toward the pointer at different depths.
const parallaxItems = [...document.querySelectorAll('.parallax')];
const cursorGlow = document.querySelector('.cursor-glow');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let frame;

  const renderParallax = () => {
    const nx = (mouseX / window.innerWidth - 0.5) * 2;
    const ny = (mouseY / window.innerHeight - 0.5) * 2;

    parallaxItems.forEach(item => {
      const depth = Number(item.dataset.depth || 10);
      const baseRotate = item.classList.contains('ornament-a') ? 12 :
                         item.classList.contains('ornament-b') ? -16 :
                         item.classList.contains('ornament-c') ? -6 : 0;
      item.style.transform = `translate3d(${nx * depth}px, ${ny * depth}px, 0) rotate(${baseRotate}deg)`;
    });

    if (cursorGlow) {
      cursorGlow.style.left = `${mouseX}px`;
      cursorGlow.style.top = `${mouseY}px`;
    }

    frame = null;
  };

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!frame) frame = requestAnimationFrame(renderParallax);
  }, { passive: true });
}

// Soft entrance animation as sections and artwork enter the viewport.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  revealItems.forEach(el => observer.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('visible'));
}
