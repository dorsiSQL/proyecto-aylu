// ===============================
// CARRUSEL FUNCIONAL + RESPONSIVE
// ===============================

let currentIndex = 0;

function getPerView() {
  const width = window.innerWidth;

  if (width < 768) return 1;       // mobile
  if (width < 1100) return 2;      // tablet
  return 3;                        // desktop
}

function updateCarousel() {
  const track = document.querySelector('.carousel-track');
  const items = document.querySelectorAll('.carousel-item');

  if (!track || items.length === 0) return;

  const perView = getPerView();
  const totalItems = items.length;

  const itemWidth = 100 / perView;

  items.forEach(item => {
    item.style.minWidth = `${itemWidth}%`;
    item.style.maxWidth = `${itemWidth}%`;
  });

  // limitar índice
  if (currentIndex > totalItems - perView) {
    currentIndex = totalItems - perView;
  }

  if (currentIndex < 0) currentIndex = 0;

  const translateX = -(currentIndex * itemWidth);
  track.style.transform = `translateX(${translateX}%)`;
}

// ===============================
// CONTROLES
// ===============================

function nextSlide() {
  const items = document.querySelectorAll('.carousel-item');
  const perView = getPerView();

  if (currentIndex < items.length - perView) {
    currentIndex++;
    updateCarousel();
  }
}

function prevSlide() {
  if (currentIndex > 0) {
    currentIndex--;
    updateCarousel();
  }
}

// ===============================
// INIT
// ===============================

window.addEventListener('load', updateCarousel);
window.addEventListener('resize', updateCarousel);

document.addEventListener('DOMContentLoaded', () => {
  const nextBtn = document.querySelector('.carousel-next');
  const prevBtn = document.querySelector('.carousel-prev');

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
});