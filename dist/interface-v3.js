// Navigation only; environmental data and filters use the existing application.
const links = [...document.querySelectorAll('.v3-sidebar nav a')];
const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
function updateNavigation() {
  let current = sections[0];
  for (const section of sections) if (section.getBoundingClientRect().top <= 180) current = section;
  for (const link of links) {
    if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
let scheduled = false;
addEventListener('scroll', () => {
  if (!scheduled) requestAnimationFrame(() => { updateNavigation(); scheduled = false; });
  scheduled = true;
}, { passive: true });
updateNavigation();
