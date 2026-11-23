/* =========================================================
   Sayed Edrees Khurshid — Portfolio scripts
   Lightweight, dependency-free, accessibility-aware.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const mqlDark = window.matchMedia('(prefers-color-scheme: dark)');

  /* ---------- 1. THEME ---------- */
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const themeIcon   = themeToggle?.querySelector('.mode-icon');

  function applyTheme(theme, persist = true) {
    root.setAttribute('data-theme', theme);
    if (persist) {
      try { localStorage.setItem('theme', theme); } catch (_) {}
    }
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
      themeToggle.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '🌑' : '🌞';
    const metaLight = document.querySelector('meta[name="theme-color"][media*="light"]');
    const metaDark  = document.querySelector('meta[name="theme-color"][media*="dark"]');
    // Optional: sync address-bar color on browsers that honor the first meta only
    if (metaLight && metaDark) { /* left as-is; native media queries handle it */ }
  }

  // Initial state (head script already set attribute — sync UI)
  applyTheme(root.getAttribute('data-theme') || 'light', false);

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });

  // Follow OS changes only if the user never picked a theme
  mqlDark.addEventListener?.('change', (e) => {
    let stored = null;
    try { stored = localStorage.getItem('theme'); } catch (_) {}
    if (!stored) applyTheme(e.matches ? 'dark' : 'light', false);
  });

  /* ---------- 2. HEADER SCROLL STATE ---------- */
  const header = document.querySelector('[data-header]');
  let ticking = false;

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ---------- 3. MOBILE NAV ---------- */
  const burger = document.querySelector('[data-burger]');
  const nav    = document.querySelector('[data-nav]');

  function setNav(open) {
    if (!burger || !nav) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
  }

  burger?.addEventListener('click', () => {
    setNav(burger.getAttribute('aria-expanded') !== 'true');
  });

  // Close on link click
  nav?.addEventListener('click', (e) => {
    if (e.target.closest('a')) setNav(false);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setNav(false);
  });

  // Close on resize back to desktop
  const mqlWide = window.matchMedia('(min-width: 761px)');
  mqlWide.addEventListener?.('change', (e) => { if (e.matches) setNav(false); });

  /* ---------- 4. AUTO YEAR ---------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 5. SCROLL REVEAL (respects reduced motion) ---------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.section, .history, .box, .skill-box');

  if (!prefersReduced && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-reveal');
    targets.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = 'opacity .55s ease, transform .55s ease';
      el.style.willChange = 'opacity, transform';
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach((el) => io.observe(el));
  }

  /* ---------- 6. FRIENDLY CONSOLE SIGNATURE ---------- */
  console.log('%cBuilt by Sayed Edrees Khurshid — Front-End Web Developer',
              'color: goldenrod; font-weight: 700;');

  /* ---------- 7. CONTACT FORM ---------- */
  const form = document.getElementById('contact-form');

  if (form) {
    const status    = form.querySelector('[data-form-status]');
    const submitBtn = form.querySelector('[data-submit]');
    const btnText   = submitBtn?.querySelector('.btn-text');

    const rules = {
      name:    (v) => v.trim().length >= 2 || 'Please enter at least 2 characters.',
      email:   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter a valid email address.',
      message: (v) => v.trim().length >= 10 || 'Message should be at least 10 characters.'
    };

    function setError(field, message) {
      const wrap = field.closest('.field');
      const err  = wrap?.querySelector('.field-error');
      if (!wrap || !err) return;

      if (message) {
        wrap.classList.add('is-invalid');
        err.textContent = message;
        err.hidden = false;
        field.setAttribute('aria-invalid', 'true');
      } else {
        wrap.classList.remove('is-invalid');
        err.textContent = '';
        err.hidden = true;
        field.removeAttribute('aria-invalid');
      }
    }

    function validateField(field) {
      const rule = rules[field.name];
      if (!rule) return true;

      const result = rule(field.value);
      if (result === true) { setError(field, ''); return true; }
      setError(field, result);
      return false;
    }

    // Live validation
    form.querySelectorAll('input, textarea').forEach((field) => {
      if (rules[field.name]) {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
          if (field.closest('.field')?.classList.contains('is-invalid')) {
            validateField(field);
          }
        });
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 1. Validate
      let firstInvalid = null;
      ['name', 'email', 'message'].forEach((name) => {
        const field = form.elements[name];
        if (field && !validateField(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        if (status) {
          status.textContent = 'Please fix the highlighted fields.';
          status.className = 'form-status is-error';
        }
        return;
      }

      // 2. Honeypot check
      if (form.elements.company?.value) { form.reset(); return; }

      // 3. Send
      submitBtn.classList.add('is-loading');
      submitBtn.setAttribute('disabled', 'true');
      if (btnText) btnText.textContent = 'Sending…';
      if (status) { status.textContent = ''; status.className = 'form-status'; }

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          form.reset();
          if (status) {
            status.textContent = "Thanks! Your message was sent — I'll get back to you soon.";
            status.className = 'form-status is-success';
          }
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.errors?.[0]?.message || 'Request failed');
        }
      } catch (err) {
        if (status) {
          status.textContent = 'Something went wrong. Please try again or email me directly.';
          status.className = 'form-status is-error';
        }
      } finally {
        submitBtn.classList.remove('is-loading');
        submitBtn.removeAttribute('disabled');
        if (btnText) btnText.textContent = 'Send Message';
      }
    });
  }
})();
