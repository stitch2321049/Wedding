(function () {
  const WEDDING_START = new Date('2027-01-17T11:00:00+08:00');
  const DECLINE = '無法出席，獻上最誠摯的祝福';

  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  updateThemeIcon();

  toggle?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    updateThemeIcon();
  });

  function updateThemeIcon() {
    if (!toggle) return;
    toggle.setAttribute('aria-label', theme === 'dark' ? '切換淺色模式' : '切換深色模式');
    toggle.innerHTML =
      theme === 'dark'
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  const countdown = document.getElementById('countdown');
  if (countdown) {
    const daysEl = countdown.querySelector('[data-unit="days"]');
    const hoursEl = countdown.querySelector('[data-unit="hours"]');
    const minsEl = countdown.querySelector('[data-unit="mins"]');
    const secsEl = countdown.querySelector('[data-unit="secs"]');

    function pad(n, width) {
      return String(Math.max(0, n)).padStart(width, '0');
    }

    function tick() {
      const diff = WEDDING_START.getTime() - Date.now();
      if (diff <= 0) {
        countdown.classList.add('is-complete');
        countdown.textContent = '我們已結為連理';
        return;
      }
      const sec = Math.floor(diff / 1000);
      if (daysEl) daysEl.textContent = pad(Math.floor(sec / 86400), 3);
      if (hoursEl) hoursEl.textContent = pad(Math.floor((sec % 86400) / 3600), 2);
      if (minsEl) minsEl.textContent = pad(Math.floor((sec % 3600) / 60), 2);
      if (secsEl) secsEl.textContent = pad(sec % 60, 2);
      window.setTimeout(tick, 250);
    }

    tick();
  }

  document.querySelectorAll('.acc-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.acc-trigger').forEach((other) => {
        other.setAttribute('aria-expanded', 'false');
      });
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  const form = document.getElementById('rsvp-form');
  const iframe = document.getElementById('hidden_iframe');
  const total = document.getElementById('f-total');
  const adults = document.getElementById('f-adults');
  const children = document.getElementById('f-children');
  const childExtras = document.getElementById('child-extras');
  const chair = document.getElementById('f-chair');
  const attend = document.getElementById('f-attend');
  const attendanceDetailInputs = document.querySelectorAll('input[name="entry.1645885313"]');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  const thanks = document.getElementById('thanks');
  let pendingSubmit = false;

  if (!form || !total || !adults || !children || !attend || !statusEl || !submitBtn) return;

  function parseCount(input) {
    const value = Number.parseInt(input.value, 10);
    return Number.isFinite(value) ? value : 0;
  }

  function syncChildExtras() {
    const hasChildren = parseCount(children) > 0;
    if (childExtras) {
      childExtras.hidden = !hasChildren;
      childExtras.classList.toggle('is-open', hasChildren);
    }
    if (chair) {
      chair.disabled = !hasChildren;
      chair.required = hasChildren;
      if (!hasChildren) chair.value = '';
    }
  }

  function setError(id, message) {
    const input = document.getElementById(id);
    const field = input?.closest('.field') || document.getElementById(id + '-field');
    const error = document.querySelector('[data-error-for="' + id + '"]');
    field?.classList.toggle('is-invalid', Boolean(message));
    if (error) error.textContent = message || '';
  }

  function validateCount(id, label) {
    const input = document.getElementById(id);
    const value = Number.parseInt(input?.value, 10);
    if (!input || input.value === '' || !Number.isFinite(value) || value < 0) {
      setError(id, '請填寫' + label);
      return null;
    }
    setError(id, '');
    return value;
  }

  function validate() {
    let ok = true;
    const name = document.getElementById('f-name');
    const phone = document.getElementById('f-phone');
    const relation = document.getElementById('f-relation');
    const attendanceDetail = document.querySelector('input[name="entry.1645885313"]:checked');

    if (!name?.value.trim()) {
      setError('f-name', '請填寫姓名');
      ok = false;
    } else {
      setError('f-name', '');
    }

    if (!attend.value) {
      setError('f-attend', '請選擇出席意向');
      ok = false;
    } else {
      setError('f-attend', '');
    }

    if (!relation?.value) {
      setError('f-relation', '請選擇關係');
      ok = false;
    } else {
      setError('f-relation', '');
    }

    if (!attendanceDetail) {
      setError('f-attendance-details', '請選擇出席資訊');
      ok = false;
    } else {
      setError('f-attendance-details', '');
    }

    if (!phone?.value.trim()) {
      setError('f-phone', '請填寫電話');
      ok = false;
    } else {
      setError('f-phone', '');
    }

    const totalCount = validateCount('f-total', '總出席人數');
    const adultCount = validateCount('f-adults', '成人人數');
    const childCount = validateCount('f-children', '兒童人數');
    if (totalCount === null || adultCount === null || childCount === null) ok = false;

    if (totalCount !== null && adultCount !== null && childCount !== null && adultCount + childCount !== totalCount) {
      setError('f-total', '總人數須等於成人人數加兒童人數');
      setError('f-adults', '請核對人數');
      setError('f-children', '請核對人數');
      ok = false;
    }

    if (childCount !== null && childCount > 0) {
      if (!chair?.value) {
        setError('f-chair', '請選擇所需兒童座椅數量');
        ok = false;
      } else {
        setError('f-chair', '');
      }
    } else {
      setError('f-chair', '');
    }

    return ok;
  }

  children.addEventListener('input', syncChildExtras);
  children.addEventListener('change', syncChildExtras);

  attend.addEventListener('change', () => {
    if (attend.value === DECLINE) {
      if (total.value === '') total.value = '0';
      if (adults.value === '') adults.value = '0';
      if (children.value === '') children.value = '0';
      syncChildExtras();
    }
  });

  attendanceDetailInputs.forEach((input) => {
    input.addEventListener('change', () => setError('f-attendance-details', ''));
  });

  form.addEventListener('submit', (event) => {
    if (!validate()) {
      event.preventDefault();
      statusEl.textContent = '請先補齊或核對必填欄位。';
      return;
    }
    pendingSubmit = true;
    submitBtn.disabled = true;
    statusEl.textContent = '正在送出……';
  });

  iframe?.addEventListener('load', () => {
    if (!pendingSubmit) return;
    pendingSubmit = false;
    form.hidden = true;
    if (thanks) {
      thanks.hidden = false;
      thanks.classList.add('is-visible');
    }
    statusEl.textContent = '';
  });

  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      const fallback = document.createElement('div');
      fallback.className = 'img-fallback';
      fallback.setAttribute('role', 'img');
      fallback.setAttribute('aria-label', img.alt || '');
      img.replaceWith(fallback);
    });
  });

  syncChildExtras();
})();

/* =========================================================
   Our Memories — Organic / Natural photo carousel
   ========================================================= */
(function initMemoryGallery() {
  const carousel = document.querySelector("[data-gallery-carousel]");

  if (!carousel) return;

  const viewport = carousel.querySelector(".memory-gallery__viewport");
  const slides = Array.from(carousel.querySelectorAll("[data-gallery-slide]"));
  const previousButton = carousel.querySelector("[data-gallery-prev]");
  const nextButton = carousel.querySelector("[data-gallery-next]");
  const dotsContainer = carousel.querySelector("[data-gallery-dots]");
  const status = document.getElementById("memory-gallery-status");

  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImage = lightbox?.querySelector(".gallery-lightbox__image");
  const lightboxCaption = lightbox?.querySelector(".gallery-lightbox__caption");
  const closeButtons = lightbox?.querySelectorAll("[data-gallery-close]") || [];

  let activeIndex = 0;
  let lastFocusedElement = null;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;
  let isDragging = false;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "memory-gallery__dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `顯示第 ${index + 1} 張相片`);
    dot.setAttribute("aria-controls", "memory-gallery-status");
    dot.setAttribute("aria-selected", index === 0 ? "true" : "false");
    dot.tabIndex = index === 0 ? 0 : -1;

    dot.addEventListener("click", () => {
      scrollToSlide(index, true);
    });

    dotsContainer.appendChild(dot);
    return dot;
  });

  function getClosestSlideIndex() {
    const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;

    return slides.reduce((closestIndex, slide, index) => {
      const closestSlide = slides[closestIndex];
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const closestCenter = closestSlide.offsetLeft + closestSlide.offsetWidth / 2;

      return Math.abs(slideCenter - viewportCenter) <
        Math.abs(closestCenter - viewportCenter)
        ? index
        : closestIndex;
    }, 0);
  }

  function updateActiveSlide() {
    const nextActiveIndex = getClosestSlideIndex();

    if (nextActiveIndex === activeIndex && status?.textContent) return;

    activeIndex = nextActiveIndex;

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;

      dot.setAttribute("aria-selected", String(isActive));
      dot.tabIndex = isActive ? 0 : -1;
    });

    if (status) {
      status.textContent = `第 ${activeIndex + 1} 張，共 ${slides.length} 張`;
    }
  }

  function scrollToSlide(index, shouldFocus = false) {
    const normalizedIndex = (index + slides.length) % slides.length;
    const slide = slides[normalizedIndex];

    viewport.scrollTo({
      left: slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth"
    });

    if (shouldFocus) {
      dots[normalizedIndex].focus();
    }
  }

  previousButton.addEventListener("click", () => {
    scrollToSlide(activeIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    scrollToSlide(activeIndex + 1);
  });

  viewport.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateActiveSlide);
  }, { passive: true });

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollToSlide(activeIndex - 1, true);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollToSlide(activeIndex + 1, true);
    }

    if (event.key === "Home") {
      event.preventDefault();
      scrollToSlide(0, true);
    }

    if (event.key === "End") {
      event.preventDefault();
      scrollToSlide(slides.length - 1, true);
    }
  });

  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    isDragging = true;
    dragStartX = event.clientX;
    dragStartScrollLeft = viewport.scrollLeft;

    viewport.classList.add("is-dragging");
    viewport.setPointerCapture?.(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const dragDistance = event.clientX - dragStartX;
    viewport.scrollLeft = dragStartScrollLeft - dragDistance;
  });

  function finishDragging(event) {
    if (!isDragging) return;

    isDragging = false;
    viewport.classList.remove("is-dragging");

    if (event?.pointerId !== undefined) {
      viewport.releasePointerCapture?.(event.pointerId);
    }

    updateActiveSlide();
    scrollToSlide(activeIndex);
  }

  viewport.addEventListener("pointerup", finishDragging);
  viewport.addEventListener("pointercancel", finishDragging);
  viewport.addEventListener("pointerleave", (event) => {
    if (isDragging && event.pointerType === "mouse") {
      finishDragging(event);
    }
  });

  function openLightbox(button) {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;

    lastFocusedElement = button;
    lightboxImage.src = button.dataset.galleryFull || "";
    lightboxImage.alt = button.dataset.galleryAlt || "";
    lightboxCaption.textContent = button.dataset.galleryAlt || "";

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-lightbox-open");

    const closeButton = lightbox.querySelector(".gallery-lightbox__close");
    closeButton?.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;

    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-lightbox-open");

    window.setTimeout(() => {
      if (lightboxImage) {
        lightboxImage.src = "";
        lightboxImage.alt = "";
      }

      if (lightboxCaption) {
        lightboxCaption.textContent = "";
      }
    }, 300);

    lastFocusedElement?.focus();
  }

  carousel.querySelectorAll("[data-gallery-open]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!isDragging) openLightbox(button);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeLightbox);
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "Tab") {
      const focusableElements = Array.from(
        lightbox.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(updateActiveSlide);
  });

  updateActiveSlide();
})();

