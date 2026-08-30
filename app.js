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
  const attendanceDetails = document.getElementById('attendance-details-field');
  const attendanceDetailInputs = document.querySelectorAll('input[name="entry.1645885313"]');
  const status = document.getElementById('form-status');
  const submitButton = document.getElementById('submit-btn');
  const thanks = document.getElementById('thanks');
const attendanceOnlyFields = [
  attendanceDetails,
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

  attendanceDetailInputs.forEach((input) => {
    input.checked = false;
  });

  [
    'f-attendance-details',
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

    if (attend?.value === DECLINE) return valid;

    if (!vegetarian?.value) {
  setError('f-vegetarian', '請選擇是否需要素食');
  valid = false;
} else {
  setError('f-vegetarian', '');
}
    const attendanceChoice = document.querySelector('input[name="entry.1645885313"]:checked');
    if (!attendanceChoice) {
      setError('f-attendance-details', '請選擇出席資訊');
      valid = false;
    } else {
      setError('f-attendance-details', '');
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

    if (totalCount !== null && adultCount !== null && childCount !== null && totalCount !== adultCount + childCount) {
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
  attendanceDetailInputs.forEach((input) => input.addEventListener('change', () => setError('f-attendance-details', '')));

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
