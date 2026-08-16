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
