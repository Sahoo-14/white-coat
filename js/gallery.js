/**
 * ============================================================
 *  Bhanja College of Nursing — gallery.js
 *  Gallery page: tab filtering, lightbox, lazy loading
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initGallery();
});

function initGallery() {
  const galleryGrid = document.querySelector('.gallery-grid');
  if (!galleryGrid) return; // not on the gallery page

  const gallery = typeof getGallery === 'function' ? getGallery() : [];

  /* ── State ──────────────────────────────────────────────── */
  let currentFilter   = 'all';
  let lightboxIndex   = -1;
  let filteredItems   = [...gallery];

  /* ────────────────────────────────────────────────────────
     Render Gallery Grid
     ──────────────────────────────────────────────────────── */
  function renderGallery(items) {
    if (items.length === 0) {
      galleryGrid.innerHTML = '<p class="no-data">No images found in this category.</p>';
      return;
    }

    galleryGrid.innerHTML = items
      .map(
        (img, idx) => `
        <div class="gallery-item" data-category="${img.category}" data-index="${idx}">
          <div class="gallery-image-wrapper">
            <img
              class="gallery-img lazy"
              data-src="${img.src}"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e0e0e0' width='400' height='300'/%3E%3C/svg%3E"
              alt="${img.caption}"
              loading="lazy"
            />
            <div class="gallery-overlay">
              <span class="gallery-zoom-icon"><i class="fas fa-search-plus"></i></span>
            </div>
          </div>
          <p class="gallery-caption">${img.caption}</p>
        </div>`
      )
      .join('');

    // Attach click listeners for lightbox
    galleryGrid.querySelectorAll('.gallery-item').forEach((item) => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        openLightbox(idx);
      });
    });

    // Kick off lazy loading for newly rendered images
    observeLazyImages();
  }

  /* ────────────────────────────────────────────────────────
     Tab Filtering
     ──────────────────────────────────────────────────────── */
  const tabs = document.querySelectorAll('.gallery-tab');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.getAttribute('data-category') || 'all';
      if (category === currentFilter) return;

      currentFilter = category;

      // Update active tab
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      // Fade out → re-render → fade in
      galleryGrid.classList.add('fade-out');

      setTimeout(() => {
        filteredItems =
          category === 'all'
            ? [...gallery]
            : gallery.filter((img) => img.category === category);

        renderGallery(filteredItems);
        galleryGrid.classList.remove('fade-out');
        galleryGrid.classList.add('fade-in');

        // Clean up animation class
        setTimeout(() => galleryGrid.classList.remove('fade-in'), 400);
      }, 300); // matches CSS transition duration
    });
  });

  /* ────────────────────────────────────────────────────────
     Lightbox
     ──────────────────────────────────────────────────────── */
  // Create lightbox element if it doesn't exist in HTML
  let lightbox = document.querySelector('.lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-overlay"></div>
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
        <button class="lightbox-prev" aria-label="Previous image">&#10094;</button>
        <img class="lightbox-img" src="" alt="" />
        <button class="lightbox-next" aria-label="Next image">&#10095;</button>
        <p class="lightbox-caption"></p>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg     = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxClose   = lightbox.querySelector('.lightbox-close');
  const lightboxPrev    = lightbox.querySelector('.lightbox-prev');
  const lightboxNext    = lightbox.querySelector('.lightbox-next');
  const lightboxOverlay = lightbox.querySelector('.lightbox-overlay');

  function openLightbox(index) {
    if (index < 0 || index >= filteredItems.length) return;

    lightboxIndex = index;
    const item = filteredItems[index];

    lightboxImg.src         = item.src;
    lightboxImg.alt         = item.caption;
    lightboxCaption.textContent = item.caption;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxIndex = -1;
  }

  function showPrev() {
    if (filteredItems.length === 0) return;
    lightboxIndex =
      lightboxIndex <= 0 ? filteredItems.length - 1 : lightboxIndex - 1;
    updateLightboxImage();
  }

  function showNext() {
    if (filteredItems.length === 0) return;
    lightboxIndex =
      lightboxIndex >= filteredItems.length - 1 ? 0 : lightboxIndex + 1;
    updateLightboxImage();
  }

  function updateLightboxImage() {
    const item = filteredItems[lightboxIndex];
    if (!item) return;

    // Fade transition
    lightboxImg.style.opacity = 0;
    setTimeout(() => {
      lightboxImg.src             = item.src;
      lightboxImg.alt             = item.caption;
      lightboxCaption.textContent = item.caption;
      lightboxImg.style.opacity   = 1;
    }, 200);
  }

  // Lightbox event listeners
  if (lightboxClose)   lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
  if (lightboxPrev)    lightboxPrev.addEventListener('click', showPrev);
  if (lightboxNext)    lightboxNext.addEventListener('click', showNext);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showPrev();
        break;
      case 'ArrowRight':
        showNext();
        break;
    }
  });

  // Touch / swipe in lightbox
  let lbTouchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    lbTouchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const diff = lbTouchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? showNext() : showPrev();
    }
  }, { passive: true });

  /* ────────────────────────────────────────────────────────
     Lazy Loading (IntersectionObserver)
     ──────────────────────────────────────────────────────── */
  function observeLazyImages() {
    const lazyImages = galleryGrid.querySelectorAll('img.lazy');
    if (lazyImages.length === 0) return;

    const imgObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const realSrc = img.getAttribute('data-src');

            if (realSrc) {
              img.src = realSrc;
              img.removeAttribute('data-src');
            }
            img.classList.remove('lazy');
            img.classList.add('loaded');
            obs.unobserve(img);
          }
        });
      },
      { rootMargin: '100px' } // start loading a bit before the image is visible
    );

    lazyImages.forEach((img) => imgObserver.observe(img));
  }

  /* ── Initial Render ─────────────────────────────────────── */
  filteredItems = [...gallery];
  renderGallery(filteredItems);
}
