(function () {
  const WEDDING_START = new Date('2027-01-17T11:00:00+08:00');
  const DECLINE = '無法出席，獻上最誠摯的祝福';

  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  updateThemeIcon();

  toggle &&
    toggle.addEventListener('click', () => {
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
  const daysEl = countdown.querySelector('[data-unit="days"]');
  const hoursEl = countdown.querySelector('[data-unit="hours"]');
  const minsEl = countdown.querySelector('[data-unit="mins"]');
  const secsEl = countdown.querySelector('[data-unit="secs"]');

  function pad(n, w) {
    return String(Math.max(0, n)).padStart(w, '0');
  }

  function tick() {
    const diff = WEDDING_START.getTime() - Date.now();
    if (diff <= 0) {
      countdown.classList.add('is-complete');
      countdown.textContent = '我們已結為連理';
      return;
    }
    const sec = Math.floor(diff / 1000);
    daysEl.textContent = pad(Math.floor(sec / 86400), 3);
    hoursEl.textContent = pad(Math.floor((sec % 86400) / 3600), 2);
    minsEl.textContent = pad(Math.floor((sec % 3600) / 60), 2);
    secsEl.textContent = pad(sec % 60, 2);
    requestAnimationFrame(() => setTimeout(tick, 250));
  }
  tick();

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
  const extras = document.getElementById('banquet-extras');
  const banquet = document.getElementById('f-banquet');
  const ceremony = document.getElementById('f-ceremony');
  const attend = document.getElementById('f-attend');
  const diet = document.getElementById('f-diet');
  const chair = document.getElementById('f-chair');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  const thanks = document.getElementById('thanks');
  let pendingSubmit = false;

  function banquetCount() {
    const n = Number.parseInt(banquet.value, 10);
    return Number.isFinite(n) ? n : 0;
  }

  function syncExtras() {
    const show = banquetCount() > 0;
    extras.hidden = !show;
    extras.classList.toggle('is-open', show);
    diet.disabled = !show;
    chair.disabled = !show;
    if (!show) {
      diet.value = '';
      chair.value = '';
    }
  }

  banquet.addEventListener('input', syncExtras);
  banquet.addEventListener('change', syncExtras);

  attend.addEventListener('change', () => {
    if (attend.value === DECLINE) {
      if (ceremony.value === '') ceremony.value = '0';
      if (banquet.value === '') banquet.value = '0';
      syncExtras();
    }
  });

  function setError(id, msg) {
    const field = document.getElementById(id).closest('.field');
    const err = document.querySelector('[data-error-for="' + id + '"]');
    field.classList.toggle('is-invalid', Boolean(msg));
    if (err) err.textContent = msg || '';
  }

  function validate() {
    let ok = true;
    const name = document.getElementById('f-name');
    const phone = document.getElementById('f-phone');
    const relation = document.getElementById('f-relation');

    if (!name.value.trim()) {
      setError('f-name', '請填寫姓名');
      ok = false;
    } else setError('f-name', '');

    if (!attend.value) {
      setError('f-attend', '請選擇出席意向');
      ok = false;
    } else setError('f-attend', '');

    if (!relation.value) {
      setError('f-relation', '請選擇關係');
      ok = false;
    } else setError('f-relation', '');

    if (!phone.value.trim()) {
      setError('f-phone', '請填寫電話');
      ok = false;
    } else setError('f-phone', '');

    const cer = Number.parseInt(ceremony.value, 10);
    if (ceremony.value === '' || !Number.isFinite(cer) || cer < 0) {
      setError('f-ceremony', '請填寫人數');
      ok = false;
    } else setError('f-ceremony', '');

    const ban = Number.parseInt(banquet.value, 10);
    if (banquet.value === '' || !Number.isFinite(ban) || ban < 0) {
      setError('f-banquet', '請填寫人數');
      ok = false;
    } else setError('f-banquet', '');

    return ok;
  }

  form.addEventListener('submit', (e) => {
    if (!validate()) {
      e.preventDefault();
      statusEl.textContent = '請先補齊必填欄位。';
      return;
    }
    pendingSubmit = true;
    submitBtn.disabled = true;
    statusEl.textContent = '正在送出……';
  });

  iframe.addEventListener('load', () => {
    if (!pendingSubmit) return;
    pendingSubmit = false;
    form.hidden = true;
    thanks.hidden = false;
    thanks.classList.add('is-visible');
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

  syncExtras();
})();
