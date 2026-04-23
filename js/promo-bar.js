document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('[data-promo-track]');
  if (!track) return;

  const originalHTML = track.innerHTML;

  // Duplicamos contenido hasta cubrir bien la pantalla
  while (track.scrollWidth < window.innerWidth * 2) {
    track.innerHTML += originalHTML;
  }

  const speed = 40; // px por segundo
  const startTimeKey = 'promoBarStartTime';

  if (!localStorage.getItem(startTimeKey)) {
    localStorage.setItem(startTimeKey, Date.now().toString());
  }

  const startTime = Number(localStorage.getItem(startTimeKey));

  function animate() {
    const elapsed = (Date.now() - startTime) / 1000;
    const distance = elapsed * speed;
    const loopWidth = track.scrollWidth / 2;
    const offset = distance % loopWidth;

    track.style.transform = `translateX(-${offset}px)`;

    requestAnimationFrame(animate);
  }

  animate();
});