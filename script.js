const cards = document.querySelectorAll('.art-card');
const lightbox = document.getElementById('lightbox');
const image = document.getElementById('lightboxImage');
const title = document.getElementById('lightboxTitle');
const medium = document.getElementById('lightboxMedium');
const size = document.getElementById('lightboxSize');
const frame = document.getElementById('lightboxFrame');
const status = document.getElementById('lightboxStatus');
const inquiry = document.getElementById('lightboxInquiry');
const closeBtn = document.getElementById('closeLightbox');
const backdrop = lightbox.querySelector('.lightbox-backdrop');
const gallerySpotlight = document.querySelector('.gallery-spotlight');
const collectionSection = document.querySelector('.collection');
const lightboxViewport = document.getElementById('lightboxViewport');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const zoomResetBtn = document.getElementById('zoomReset');

let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isDraggingArtwork = false;
let dragMoved = false;
let dragStartX = 0;
let dragStartY = 0;
let dragOriginX = 0;
let dragOriginY = 0;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

function clampArtworkPan(){
  if (!lightboxViewport || zoomLevel <= 1) {
    panX = 0;
    panY = 0;
    return;
  }
  const maxX = (lightboxViewport.clientWidth * (zoomLevel - 1)) / 2;
  const maxY = (lightboxViewport.clientHeight * (zoomLevel - 1)) / 2;
  panX = Math.max(-maxX, Math.min(maxX, panX));
  panY = Math.max(-maxY, Math.min(maxY, panY));
}

function renderArtworkZoom(){
  clampArtworkPan();
  image.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoomLevel})`;
  image.classList.toggle('is-zoomed', zoomLevel > 1);
  lightboxViewport?.classList.toggle('has-zoom', zoomLevel > 1);
  if (zoomResetBtn) zoomResetBtn.textContent = `${Math.round(zoomLevel * 100)}%`;
  if (zoomOutBtn) zoomOutBtn.disabled = zoomLevel <= MIN_ZOOM;
  if (zoomInBtn) zoomInBtn.disabled = zoomLevel >= MAX_ZOOM;
}

function setArtworkZoom(nextZoom){
  zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));
  if (zoomLevel === 1) {
    panX = 0;
    panY = 0;
  }
  renderArtworkZoom();
}

function resetArtworkZoom(){
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  isDraggingArtwork = false;
  dragMoved = false;
  image.classList.remove('is-dragging');
  renderArtworkZoom();
}

function closeLightbox(){
  resetArtworkZoom();
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

cards.forEach(card => card.addEventListener('click', () => {
  image.src = card.dataset.img;
  image.alt = card.dataset.title;
  title.textContent = card.dataset.title || '';
  medium.textContent = card.dataset.medium || '';
  size.textContent = card.dataset.size ? `Artwork: ${card.dataset.size}` : '';
  frame.textContent = card.dataset.frame || '';
  status.textContent = card.dataset.status || '';
  inquiry.textContent = card.dataset.title === 'Composition in Bleu' ? 'Inquire about prints' : 'Pricing by inquiry';
  resetArtworkZoom();
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}));

closeBtn.addEventListener('click', closeLightbox);
backdrop.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeLightbox();
  if(!lightbox.classList.contains('active')) return;
  if(e.key === '+' || e.key === '=') setArtworkZoom(zoomLevel + ZOOM_STEP);
  if(e.key === '-' || e.key === '_') setArtworkZoom(zoomLevel - ZOOM_STEP);
  if(e.key === '0') resetArtworkZoom();
});
inquiry.addEventListener('click', closeLightbox);

zoomInBtn?.addEventListener('click', event => {
  event.stopPropagation();
  setArtworkZoom(zoomLevel + ZOOM_STEP);
});
zoomOutBtn?.addEventListener('click', event => {
  event.stopPropagation();
  setArtworkZoom(zoomLevel - ZOOM_STEP);
});
zoomResetBtn?.addEventListener('click', event => {
  event.stopPropagation();
  resetArtworkZoom();
});

lightboxViewport?.addEventListener('wheel', event => {
  if(!lightbox.classList.contains('active')) return;
  event.preventDefault();
  const direction = event.deltaY < 0 ? 1 : -1;
  setArtworkZoom(zoomLevel + direction * 0.25);
}, { passive:false });

image.addEventListener('pointerdown', event => {
  if(zoomLevel <= 1) return;
  isDraggingArtwork = true;
  dragMoved = false;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragOriginX = panX;
  dragOriginY = panY;
  image.classList.add('is-dragging');
  image.setPointerCapture?.(event.pointerId);
});

image.addEventListener('pointermove', event => {
  if(!isDraggingArtwork) return;
  const dx = event.clientX - dragStartX;
  const dy = event.clientY - dragStartY;
  if(Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
  panX = dragOriginX + dx;
  panY = dragOriginY + dy;
  renderArtworkZoom();
});

function endArtworkDrag(event){
  if(!isDraggingArtwork) return;
  isDraggingArtwork = false;
  image.classList.remove('is-dragging');
  try { image.releasePointerCapture?.(event.pointerId); } catch(_) {}
}
image.addEventListener('pointerup', endArtworkDrag);
image.addEventListener('pointercancel', endArtworkDrag);

image.addEventListener('click', event => {
  event.stopPropagation();
  if(dragMoved){
    dragMoved = false;
    return;
  }
  if(zoomLevel === 1) setArtworkZoom(2);
  else resetArtworkZoom();
});

image.addEventListener('dblclick', event => {
  event.preventDefault();
  event.stopPropagation();
  setArtworkZoom(zoomLevel >= 3 ? 1 : Math.min(MAX_ZOOM, zoomLevel + 1));
});

window.addEventListener('resize', () => {
  if(lightbox.classList.contains('active')) renderArtworkZoom();
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer:fine)').matches;
const parallaxItems = [...document.querySelectorAll('.parallax')];
const cursorGlow = document.querySelector('.cursor-glow');
const cursorGlowTwo = document.querySelector('.cursor-glow.glow-two');
const cursorRing = document.querySelector('.cursor-ring');

if (!reducedMotion && finePointer) {
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;

  const animateScene = () => {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    const nx = (currentX / window.innerWidth - 0.5) * 2;
    const ny = (currentY / window.innerHeight - 0.5) * 2;

    parallaxItems.forEach(item => {
      const depth = Number(item.dataset.depth || 10) * 2.6;
      const baseRotate = Number(item.dataset.rotate || 0);
      const extraRotate = nx * 6 + ny * 4;
      const scale = 1 + Math.abs(nx * 0.035) + Math.abs(ny * 0.035);
      item.style.transform = `translate3d(${nx * depth}px, ${ny * depth}px, 0) rotate(${baseRotate + extraRotate}deg) scale(${scale})`;
    });

    if (cursorGlow) { cursorGlow.style.left = `${currentX}px`; cursorGlow.style.top = `${currentY}px`; }
    if (cursorGlowTwo) { cursorGlowTwo.style.left = `${currentX}px`; cursorGlowTwo.style.top = `${currentY}px`; }
    if (cursorRing) { cursorRing.style.left = `${currentX}px`; cursorRing.style.top = `${currentY}px`; }
    requestAnimationFrame(animateScene);
  };

  window.addEventListener('mousemove', event => { targetX = event.clientX; targetY = event.clientY; }, { passive:true });
  window.addEventListener('mouseleave', () => { targetX = window.innerWidth / 2; targetY = window.innerHeight / 2; });
  requestAnimationFrame(animateScene);

  if (collectionSection && gallerySpotlight) {
    collectionSection.addEventListener('mousemove', event => {
      const rect = collectionSection.getBoundingClientRect();
      gallerySpotlight.style.left = `${event.clientX - rect.left}px`;
      gallerySpotlight.style.top = `${event.clientY - rect.top}px`;
    }, { passive:true });
  }

  cards.forEach(card => {
    const cardImage = card.querySelector('.art-stage img');
    const cardMeta = card.querySelector('.art-meta');
    card.addEventListener('mousemove', event => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const dx = px - 0.5;
      const dy = py - 0.5;
      card.style.transform = `perspective(1400px) rotateX(${-dy * 13}deg) rotateY(${dx * 15}deg) translateY(-12px) scale(1.025)`;
      card.style.setProperty('--shine-x', `${px * 100}%`);
      card.style.setProperty('--shine-y', `${py * 100}%`);
      if (cardImage) cardImage.style.transform = `translate3d(${dx * -24}px, ${dy * -20}px, 26px) scale(1.07)`;
      if (cardMeta) cardMeta.style.transform = `translate3d(${dx * 10}px, ${dy * 8}px, 24px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.setProperty('--shine-x','50%');
      card.style.setProperty('--shine-y','30%');
      if (cardImage) cardImage.style.transform = '';
      if (cardMeta) cardMeta.style.transform = '';
    });
  });
}

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -30px 0px' });
  revealItems.forEach(el => observer.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('visible'));
}
