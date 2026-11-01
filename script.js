document.documentElement.classList.add('js');

const story = document.querySelector('.scroll-story');
const front = document.querySelector('.stage-front');
const side = document.querySelector('.stage-side');
const intro = document.querySelector('.chapter-intro');
const round = document.querySelector('.chapter-round');
const profile = document.querySelector('.chapter-profile');
const light = document.querySelector('.chapter-light');
const stage = document.querySelector('.stage');
const progress = document.querySelector('#scroll-progress');
const count = document.querySelector('#chapter-number');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobile = window.matchMedia('(max-width: 600px)');
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = (start, end, value) => { const t = clamp((value - start) / (end - start)); return t * t * (3 - 2 * t); };
let framePending = false;

function updateScroll() {
  framePending = false;
  if (reducedMotion.matches) return;
  const rect = story.getBoundingClientRect();
  const viewport = document.querySelector('.stage').offsetHeight;
  const p = clamp(-rect.top / Math.max(1, story.offsetHeight - viewport));
  intro.style.opacity = String(1 - smooth(.09, .19, p));
  const roundOpacity = smooth(.25, .32, p) * (1 - smooth(.37, .44, p));
  const profileOpacity = smooth(.43, .51, p) * (1 - smooth(.64, .71, p));
  const lightOpacity = smooth(.70, .76, p) * (1 - smooth(.79, .85, p));
  round.style.opacity = String(roundOpacity);
  profile.style.opacity = String(profileOpacity);
  light.style.opacity = String(lightOpacity);
  round.setAttribute('aria-hidden', String(roundOpacity < .5));
  profile.setAttribute('aria-hidden', String(profileOpacity < .5));
  light.setAttribute('aria-hidden', String(lightOpacity < .5));
  intro.setAttribute('aria-hidden', String(p > .19));
  progress.style.transform = `scaleX(${p})`;
  count.textContent = p < .20 ? '01' : p < .46 ? '02' : '03';
  const darkness = smooth(.17, .245, p) * (1 - smooth(.93, 1, p));
  stage.style.setProperty('--stage-dark', darkness);
  stage.style.setProperty('--stage-text', darkness > .5 ? '#f2ede3' : '#302d27');
  document.querySelector('.stage-bottom').style.opacity = String((1 - 4*darkness*(1-darkness))*(1-smooth(.82,.91,p)));
  window.dispatchEvent(new CustomEvent('pendant-scroll', { detail: { progress: p } }));
}

function requestFrame() { if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); } }
window.addEventListener('scroll', requestFrame, { passive: true });
window.addEventListener('resize', requestFrame, { passive: true });
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    intro.removeAttribute('aria-hidden');
    round.setAttribute('aria-hidden', 'true');
    profile.setAttribute('aria-hidden', 'true');
    light.setAttribute('aria-hidden', 'true');
  }
  requestFrame();
});
requestFrame();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const views = {
  front: { file: 'assets/front.png', alt: 'Front view of the pendant with a clear faceted stone in a rounded golden bezel' },
  side: { file: 'assets/side.png', alt: 'Profile of the pendant showing the depth of the golden setting and its attachment loop' },
  detail: { file: 'assets/detail.png', alt: 'Macro view of the faceted stone and smoothly rounded golden bezel' },
  worn: { file: 'assets/worn.png', alt: 'The pendant worn below the collarbones on a delicate golden chain' }
};

document.querySelectorAll('[data-view]').forEach(button => {
  button.addEventListener('click', () => {
    const view = views[button.dataset.view];
    const image = document.querySelector('#product-image');
    image.src = view.file;
    image.alt = view.alt;
    document.querySelectorAll('[data-view]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
  });
});

const viewer = document.querySelector('#viewer');
const viewerImage = document.querySelector('#viewer-image');
function setViewerView(key) {
  const view = views[key];
  if (!view) return;
  viewerImage.src = view.file;
  viewerImage.alt = view.alt;
  document.querySelectorAll('[data-viewer-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.viewerView === key)));
}
document.querySelectorAll('[data-open-viewer]').forEach(button => button.addEventListener('click', () => { setViewerView(button.dataset.openViewer); viewer.showModal(); }));
document.querySelectorAll('[data-viewer-view]').forEach(button => button.addEventListener('click', () => setViewerView(button.dataset.viewerView)));
document.querySelector('.close-viewer').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => {
  const rect = viewer.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
});
