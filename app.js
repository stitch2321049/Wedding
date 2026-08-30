(function () {
  const WEDDING_START = new Date('2027-01-17T11:00:00+08:00');
  const DECLINE = '無法出席，獻上最誠摯的祝福';

  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  function updateThemeIcon() {
    if (!toggle) return;
    toggle.setAttribute('aria-label', theme === 'dark' ? '切換淺色模式' : '切換深色模式');
    toggle.textContent = theme === 'dark' ? '☼' : '☾';
  }

  updateThemeIcon();
  toggle?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    updateThemeIcon();
  });

  const countdown = document.getElementById('countdown');
  if (countdown) {
    const parts = {
      days: countdown.querySelector('[data-unit="days"]'),
      hours: countdown.querySelector('[data-unit="hours"]'),
      mins: countdown.querySelector('[data-unit="mins"]'),
      secs: countdown.querySelector('[data-unit="secs"]')
    };

    const pad = (value, width) => String(Math.max(0, value)).padStart(width, '0');
    const tick = () => {
      const diff = WEDDING_START.getTime() - Date.now();
      if (diff <= 0) {
        countdown.classList.add('is-complete');
        countdown.textContent = '我們已結為連理';
        return;
      }
      const seconds = Math.floor(diff / 1000);
      if (parts.days) parts.days.textContent = pad(Math.floor(seconds / 86400), 3);
      if (parts.hours) parts.hours.textContent = pad(Math.floor((seconds % 86400) / 3600), 2);
      if (parts.mins) parts.mins.textContent = pad(Math.floor((seconds % 3600) / 60), 2);
      if (parts.secs) parts.secs.textContent = pad(seconds % 60, 2);
      window.setTimeout(tick, 250);
    };
    tick();
  }

  document.querySelectorAll('.acc-trigger').forEach((button) => {
    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.acc-trigger').forEach((other) => other.setAttribute('aria-expanded', 'false'));
      button.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });

  const form = document.getElementById('rsvp-form');
  if (!form) return;

  const iframe = document.getElementById('hidden_iframe');
  const attend = document.getElementById('f-attend');
  const relation = document.getElementById('f-relation');
  const phone = document.getElementById('f-phone');
  const total = document.getElementById('f-total');
  const adults = document.getElementById('f-adults');
  const children = document.getElementById('f-children');
  const childExtras = document.getElementById('child-extras');
  const vegetarian = document.getElementById('f-vegetarian');
  const vegetarianField = document.getElementById('vegetarian-field');
  const chair = document.getElementById('f-chair');
  const status = document.getElementById('form-status');
  const submitButton = document.getElementById('submit-btn');
  const thanks = document.getElementById('thanks');
const attendanceOnlyFields = [
  total?.closest('.field'),
  adults?.closest('.field'),
  children?.closest('.field'),
  childExtras,
  vegetarianField
].filter(Boolean);
  let pendingSubmit = false;

  const setError = (id, message) => {
    const target = document.getElementById(id);
    const field = target?.closest('.field') || document.getElementById(id + '-field');
    const error = document.querySelector('[data-error-for="' + id + '"]');
    field?.classList.toggle('is-invalid', Boolean(message));
    if (error) error.textContent = message || '';
  };

  const count = (id) => {
    const input = document.getElementById(id);
    const value = Number.parseInt(input?.value, 10);
    return input && input.value !== '' && Number.isInteger(value) && value >= 0 ? value : null;
  };
  
function clearAttendanceOnlyValues() {
  if (total) total.value = '';
  if (adults) adults.value = '';
  if (children) children.value = '';
  if (chair) chair.value = '';
  if (vegetarian) vegetarian.value = '';

  [
    'f-total',
    'f-adults',
    'f-children',
    'f-chair',
    'f-vegetarian'
  ].forEach((id) => setError(id, ''));
}

  function syncChildExtras() {
    const hasChildren = (count('f-children') ?? 0) > 0;
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

  function syncAttendanceFields() {
    const declined = attend?.value === DECLINE;
    attendanceOnlyFields.forEach((field) => {
      field.hidden = declined;
      field.querySelectorAll('input, select, textarea').forEach((input) => {
        input.disabled = declined;
      });
    });

    if (declined) {
      clearAttendanceOnlyValues();
      if (status) status.textContent = '未能出席已記錄；請填寫關係及電話後送出回函。';
      return;
    }

    if (status?.textContent === '未能出席已記錄；請填寫關係及電話後送出回函。') status.textContent = '';
    syncChildExtras();
  }

function validate() {
  let valid = true;
  const name = document.getElementById('f-name');

  if (!name?.value.trim()) {
    setError('f-name', '請填寫姓名');
    valid = false;
  } else {
    setError('f-name', '');
  }

  if (!attend?.value) {
    setError('f-attend', '請選擇出席意向');
    valid = false;
  } else {
    setError('f-attend', '');
  }

  if (!relation?.value) {
    setError('f-relation', '請選擇關係');
    valid = false;
  } else {
    setError('f-relation', '');
  }

  if (!phone?.value.trim()) {
    setError('f-phone', '請填寫電話');
    valid = false;
  } else {
    setError('f-phone', '');
  }

  if (attend?.value === DECLINE) {
    return valid;
  }

  if (!vegetarian?.value) {
    setError('f-vegetarian', '請選擇是否需要素食');
    valid = false;
  } else {
    setError('f-vegetarian', '');
  }

  const totalCount = count('f-total');
  const adultCount = count('f-adults');
  const childCount = count('f-children');

  [
    ['f-total', totalCount, '總出席人數'],
    ['f-adults', adultCount, '成人人數'],
    ['f-children', childCount, '兒童人數']
  ].forEach(([id, value, label]) => {
    if (value === null) {
      setError(id, '請填寫' + label);
      valid = false;
    } else {
      setError(id, '');
    }
  });

  if (
    totalCount !== null &&
    adultCount !== null &&
    childCount !== null &&
    totalCount !== adultCount + childCount
  ) {
    setError('f-total', '總人數須等於成人人數加兒童人數');
    valid = false;
  }

  if (childCount !== null && childCount > 0) {
    if (!chair?.value) {
      setError('f-chair', '請選擇所需兒童座椅數量');
      valid = false;
    } else {
      setError('f-chair', '');
    }
  } else {
    setError('f-chair', '');
  }

  return valid;
}

  attend?.addEventListener('change', syncAttendanceFields);
  children?.addEventListener('input', syncChildExtras);
  children?.addEventListener('change', syncChildExtras);

  form.addEventListener('submit', (event) => {
    if (!validate()) {
      event.preventDefault();
      if (status) status.textContent = '請先補齊或核對必填欄位。';
      return;
    }

    pendingSubmit = true;
    if (submitButton) submitButton.disabled = true;
    if (status) status.textContent = '正在送出……';
  });

  iframe?.addEventListener('load', () => {
    if (!pendingSubmit) return;
    pendingSubmit = false;
    form.hidden = true;
    if (thanks) {
      thanks.hidden = false;
      thanks.classList.add('is-visible');
    }
    if (status) status.textContent = '';
  });

  syncAttendanceFields();
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

