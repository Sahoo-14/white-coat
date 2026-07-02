/**
 * ============================================================
 *  Bhanja College of Nursing — main.js
 *  Core site functionality (navbar, slider, ticker, counters,
 *  scroll effects, notice board)
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ── Initialize default data ─────────────────────────────── */
  if (typeof initializeData === 'function') {
    initializeData();
  }

  /* ── Run all modules (each guards its own selectors) ────── */
  initStickyNavbar();
  initMobileMenu();
  initHeroSlider();
  initAnnouncementTicker();
  initNoticeBoard();
  initStatsCounter();
  initScrollToTop();
  initAnimateOnScroll();
  highlightActiveNav();
  initDropdownMenus();
});

/* ================================================================
   1. Sticky Navbar
   ================================================================ */
function initStickyNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const STICKY_OFFSET = 100;

  const onScroll = () => {
    if (window.scrollY > STICKY_OFFSET) {
      navbar.classList.add('navbar-sticky');
    } else {
      navbar.classList.remove('navbar-sticky');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // apply on load in case page is already scrolled
}

/* ================================================================
   2. Mobile Menu (Hamburger Toggle)
   ================================================================ */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');

    // Toggle aria-expanded for accessibility
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
  });

  // Close menu when a link is clicked (mobile UX)
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ================================================================
   3. Hero Slider
   ================================================================ */
function initHeroSlider() {
  const slides   = document.querySelectorAll('.hero-slide');
  const dots     = document.querySelectorAll('.slider-dot');
  const prevBtn  = document.querySelector('.slider-prev');
  const nextBtn  = document.querySelector('.slider-next');

  if (slides.length === 0) return;

  let currentIndex  = 0;
  let autoplayTimer = null;
  const INTERVAL    = 5000; // 5 seconds

  /* ── Core helpers ──────────────────────────────────────── */

  /** Show slide at `index`, hiding the rest. */
  function goToSlide(index) {
    // Wrap around
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    slides.forEach((s) => s.classList.remove('active'));
    dots.forEach((d) => d.classList.remove('active'));

    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');

    currentIndex = index;
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  /** Reset and restart autoplay timer. */
  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, INTERVAL);
  }

  /* ── Dot navigation ────────────────────────────────────── */
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      resetAutoplay();
    });
  });

  /* ── Arrow navigation ──────────────────────────────────── */
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });
  }

  /* ── Keyboard navigation ───────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    // Only act when slider is likely in view (top of page)
    if (e.key === 'ArrowRight') { nextSlide(); resetAutoplay(); }
    if (e.key === 'ArrowLeft')  { prevSlide(); resetAutoplay(); }
  });

  /* ── Touch / swipe support ─────────────────────────────── */
  const sliderContainer = document.querySelector('.hero-slider');
  if (sliderContainer) {
    let touchStartX = 0;
    let touchEndX   = 0;
    const MIN_SWIPE = 50; // px

    sliderContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > MIN_SWIPE) {
        if (diff > 0) nextSlide(); // swipe left → next
        else          prevSlide(); // swipe right → prev
        resetAutoplay();
      }
    }, { passive: true });
  }

  /* ── Start autoplay ────────────────────────────────────── */
  goToSlide(0);
  autoplayTimer = setInterval(nextSlide, INTERVAL);
}

/* ================================================================
   4. Announcement Ticker
   ================================================================ */
function initAnnouncementTicker() {
  const tickerTrack = document.querySelector('.ticker-track');
  if (!tickerTrack) return;

  // Fetch notices flagged for ticker display
  const notices = typeof getNotices === 'function' ? getNotices() : [];
  const tickerNotices = notices.filter((n) => n.showOnTicker);

  if (tickerNotices.length === 0) {
    tickerTrack.innerHTML = '<span class="ticker-item">No announcements at this time.</span>';
    return;
  }

  // Build ticker items
  const buildItems = () =>
    tickerNotices
      .map(
        (n) =>
          `<span class="ticker-item">
            ${n.isNew ? '<span class="badge-new">NEW</span>' : ''}
            ${n.title}
          </span>`
      )
      .join('<span class="ticker-separator">|</span>');

  // Duplicate content so the marquee loops seamlessly
  tickerTrack.innerHTML = buildItems() + buildItems();
}

/* ================================================================
   5. Notice Board (Homepage)
   ================================================================ */
function initNoticeBoard() {
  const container = document.querySelector('.notice-list');
  if (!container) return;

  const notices = typeof getNotices === 'function' ? getNotices() : [];

  if (notices.length === 0) {
    container.innerHTML = '<p class="no-data">No notices available.</p>';
    return;
  }

  // Sort by date descending
  const sorted = [...notices].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  container.innerHTML = sorted
    .map((notice) => {
      const dateObj  = new Date(notice.date);
      const day      = dateObj.getDate();
      const month    = dateObj.toLocaleString('en-IN', { month: 'short' });
      const year     = dateObj.getFullYear();

      const badge    = notice.isNew
        ? '<span class="notice-badge">NEW</span>'
        : '';

      const pdfLink  = notice.pdfUrl
        ? `<a href="${notice.pdfUrl}" class="notice-pdf" target="_blank" title="Download PDF">
             <i class="fas fa-file-pdf"></i> Download
           </a>`
        : '';

      return `
        <div class="notice-item">
          <div class="notice-date">
            <span class="notice-day">${day}</span>
            <span class="notice-month">${month}</span>
            <span class="notice-year">${year}</span>
          </div>
          <div class="notice-content">
            <h4 class="notice-title">${notice.title} ${badge}</h4>
            <p class="notice-body">${notice.body}</p>
            ${pdfLink}
          </div>
        </div>`;
    })
    .join('');
}

/* ================================================================
   6. Stats Counter Animation
   ================================================================ */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0) return;

  const DURATION = 2000; // animation duration in ms

  /**
   * Animate a single element from 0 → target.
   */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const start  = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);

      // Ease-out quad for a natural deceleration
      const eased = 1 - Math.pow(1 - progress, 2);
      el.textContent = Math.floor(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target; // guarantee exact final value
      }
    }

    requestAnimationFrame(step);
  }

  // Observe each stat number — animate once when it enters the viewport
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target); // run only once
        }
      });
    },
    { threshold: 0.3 }
  );

  statNumbers.forEach((el) => observer.observe(el));
}

/* ================================================================
   7. Scroll-to-Top Button
   ================================================================ */
function initScrollToTop() {
  const btn = document.querySelector('.scroll-to-top');
  if (!btn) return;

  const SHOW_OFFSET = 500;

  window.addEventListener('scroll', () => {
    if (window.scrollY > SHOW_OFFSET) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ================================================================
   8. Animate on Scroll (AOS-lite)
   ================================================================ */
function initAnimateOnScroll() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (elements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ================================================================
   9. Active Nav Link Highlighting
   ================================================================ */
function highlightActiveNav() {
  const navLinks = document.querySelectorAll('.nav-links a');
  if (navLinks.length === 0) return;

  // Normalise the current path for comparison
  const currentPath = window.location.pathname
    .replace(/\\/g, '/')   // Windows backslash fix
    .replace(/index\.html$/, '')
    .replace(/\/$/, '');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkPath = new URL(href, window.location.origin).pathname
      .replace(/index\.html$/, '')
      .replace(/\/$/, '');

    if (linkPath === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ================================================================
   10. Dropdown Menus (Hover + Click)
   ================================================================ */
function initDropdownMenus() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  if (dropdowns.length === 0) return;

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu    = dropdown.querySelector('.dropdown-menu');
    if (!trigger || !menu) return;

    // Toggle on click (works on both mobile and desktop)
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      // Close other open dropdowns first
      dropdowns.forEach((d) => {
        if (d !== dropdown) d.classList.remove('open');
      });
      dropdown.classList.toggle('open');
    });

    // Open on hover (desktop)
    dropdown.addEventListener('mouseenter', () => {
      dropdown.classList.add('open');
    });
    dropdown.addEventListener('mouseleave', () => {
      dropdown.classList.remove('open');
    });
  });

  // Close all dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      dropdowns.forEach((d) => d.classList.remove('open'));
    }
  });
}
