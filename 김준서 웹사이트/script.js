let timer = null;
let seconds = 0;
let running = false;

const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("startBtn");

// 로그인 관련 요소
const loginBtn = document.querySelector('.login-btn');
const loginModal = document.getElementById('loginModal');

// 로그인 상태 표시 업데이트
function updateUserDisplay() {
  const current = localStorage.getItem('currentUser');
  if (!loginBtn) return;
  if (current) {
    loginBtn.textContent = current + '님';
    loginBtn.title = current + '님 (클릭하여 로그아웃)';
  } else {
    loginBtn.textContent = '로그인';
    loginBtn.title = '로그인';
  }
}

// 초기 표시
updateUserDisplay();

function formatTime(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

startBtn.addEventListener("click", () => {
  if (!running) {
    running = true;
    startBtn.textContent = "⏸";
    timer = setInterval(() => {
      seconds++;
      timeDisplay.textContent = formatTime(seconds);
      checkGoalReached();
    }, 1000);
  } else {
    running = false;
    startBtn.textContent = "▶";
    clearInterval(timer);
    // 일시정지 시 현재까지 누적된 시간을 저장
    if (today) {
      setSavedSecondsForDate(today.getFullYear(), today.getMonth(), today.getDate(), seconds);
    }
  }
});

// Modal open/close 함수
function openModal(modal) {
  if (!modal) return;
  modal.classList.remove('hidden');
  const firstInput = modal.querySelector('input');
  if (firstInput) firstInput.focus();
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add('hidden');
}

// 로그인 버튼 클릭으로 모달 열기 및 관련 핸들러
if (loginBtn && loginModal) {
  loginBtn.addEventListener('click', () => {
    const current = localStorage.getItem('currentUser');
    if (!current) {
      openModal(loginModal);
    } else {
      if (confirm(current + '님, 로그아웃하시겠습니까?')) {
        localStorage.removeItem('currentUser');
        updateUserDisplay();
      }
    }
  });

  const closeBtn = loginModal.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', () => closeModal(loginModal));

  // 모달 배경 클릭으로 닫기
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) closeModal(loginModal);
  });

  // ESC로 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !loginModal.classList.contains('hidden')) closeModal(loginModal);
  });

  // 폼 제출(샘플) — 실제 인증 로직은 추후 구현
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const loginError = document.getElementById('loginError');
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (loginError) loginError.textContent = '';
      const id = document.getElementById('loginId').value.trim();
      const pw = document.getElementById('password').value;

      if (!id) {
        if (loginError) loginError.textContent = '아이디를 입력하세요.';
        return;
      }

      const raw = localStorage.getItem('accounts');
      const accounts = raw ? JSON.parse(raw) : [];
      const account = accounts.find(a => a.id === id);
      if (!account) {
        if (loginError) loginError.textContent = '등록된 아이디가 없습니다.';
        return;
      }
      if (account.password !== pw) {
        if (loginError) loginError.textContent = '비밀번호가 틀렸습니다.';
        return;
      }

      // 로그인 성공 처리(샘플)
      localStorage.setItem('currentUser', id);
      closeModal(loginModal);
      updateUserDisplay();
      alert(id + '님, 로그인되었습니다.');
    });
  }
}

  // 회원가입 관련
  const signupModal = document.getElementById('signupModal');
  const openSignupBtn = document.getElementById('openSignupBtn');

  if (openSignupBtn) {
    openSignupBtn.addEventListener('click', () => {
      closeModal(loginModal);
      openModal(signupModal);
    });
  }

  if (signupModal) {
    const closeBtn = signupModal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(signupModal));

    signupModal.addEventListener('click', (e) => {
      if (e.target === signupModal) closeModal(signupModal);
    });

    const signupForm = document.getElementById('signupForm');
    const signupError = document.getElementById('signupError');
    const cancelSignup = document.getElementById('cancelSignup');

    if (cancelSignup) cancelSignup.addEventListener('click', () => closeModal(signupModal));

    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        signupError.textContent = '';
        const id = document.getElementById('signupId').value.trim();
        const pw = document.getElementById('signupPassword').value;
        const pw2 = document.getElementById('signupPasswordConfirm').value;

        if (!id) {
          signupError.textContent = '아이디를 입력하세요.';
          return;
        }
        if (pw.length < 4) {
          signupError.textContent = '비밀번호는 최소 4자 이상이어야 합니다.';
          return;
        }
        if (pw !== pw2) {
          signupError.textContent = '비밀번호가 일치하지 않습니다.';
          return;
        }

        // 간단한 로컬 저장 (샘플) - 실제 서비스에서는 안전한 서버 인증 필요
        const key = 'accounts';
        const raw = localStorage.getItem(key);
        const accounts = raw ? JSON.parse(raw) : [];
        // 중복 체크
        if (accounts.some(a => a.id === id)) {
          signupError.textContent = '이미 존재하는 아이디입니다.';
          return;
        }
        accounts.push({ id, password: pw });
        localStorage.setItem(key, JSON.stringify(accounts));

        closeModal(signupModal);
        alert('회원가입이 완료되었습니다.');
      });
    }
  }

  // ESC 키 누르면 열린 모든 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal:not(.hidden)').forEach(m => closeModal(m));
    }
  });

  // ---------- 달력 생성 및 스탬프 관리 ----------
  const calendarGrid = document.getElementById('calendarGrid');
  const menuTimer = document.getElementById('menuTimer');
  const menuCalendar = document.getElementById('menuCalendar');
  const timerSection = document.getElementById('timer-section');
  const calendarSection = document.getElementById('calendar-section');

  function getCalendarKey(y, m) {
    return `${y}-${String(m + 1).padStart(2, '0')}`;
  }

  // ---------- 목표(Goals) 저장 로직 (사용자별) ----------
  function loadGoals() {
    const raw = localStorage.getItem('goals');
    return raw ? JSON.parse(raw) : {};
  }

  function saveGoals(obj) {
    localStorage.setItem('goals', JSON.stringify(obj));
  }

  function loadGoalsForUser() {
    const user = getCurrentUserId();
    const all = loadGoals();
    return all[user] || [];
  }

  function saveGoalsForUser(arr) {
    const user = getCurrentUserId();
    const all = loadGoals();
    all[user] = arr;
    saveGoals(all);
  }

  function loadActiveGoalMap() {
    const raw = localStorage.getItem('activeGoals');
    return raw ? JSON.parse(raw) : {};
  }

  function saveActiveGoalMap(obj) {
    localStorage.setItem('activeGoals', JSON.stringify(obj));
  }

  function getActiveGoalIdForUser() {
    const user = getCurrentUserId();
    const map = loadActiveGoalMap();
    return map[user] || null;
  }

  function setActiveGoalIdForUser(id) {
    const user = getCurrentUserId();
    const map = loadActiveGoalMap();
    if (id === null) delete map[user]; else map[user] = id;
    saveActiveGoalMap(map);
  }

  function loadStamps() {
    const raw = localStorage.getItem('calendarStamps');
    return raw ? JSON.parse(raw) : {};
  }

  function saveStamps(obj) {
    localStorage.setItem('calendarStamps', JSON.stringify(obj));
  }

  // ---------- 날짜별 공부시간 저장 로직 ----------
  function getCurrentUserId() {
    return localStorage.getItem('currentUser') || 'guest';
  }

  function loadStudyTimes() {
    const raw = localStorage.getItem('studyTimes');
    return raw ? JSON.parse(raw) : {};
  }

  function saveStudyTimes(obj) {
    localStorage.setItem('studyTimes', JSON.stringify(obj));
  }

  function getDateKeyFromParts(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function getSavedSecondsForDate(y, m, d) {
    const user = getCurrentUserId();
    const data = loadStudyTimes();
    const userData = data[user] || {};
    const key = getDateKeyFromParts(y, m, d);
    return userData[key] || 0;
  }

  function setSavedSecondsForDate(y, m, d, secs) {
    const user = getCurrentUserId();
    const data = loadStudyTimes();
    data[user] = data[user] || {};
    const key = getDateKeyFromParts(y, m, d);
    data[user][key] = secs;
    saveStudyTimes(data);
  }

  function renderCalendar(year, month) {
    if (!calendarGrid) return;
    calendarGrid.innerHTML = '';
    const monthLabel = document.getElementById('monthLabel');
    if (monthLabel) monthLabel.textContent = `${year}년 ${month + 1}월`;
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = 35; // 7x5
    const stamps = loadStamps();
    const key = getCalendarKey(year, month);
    const monthStamps = stamps[key] || [];

    for (let i = 0; i < cells; i++) {
      const cell = document.createElement('div');
      cell.className = 'day';
      const dayIndex = i - startDay + 1;
      if (dayIndex >= 1 && dayIndex <= daysInMonth) {
        cell.textContent = String(dayIndex);
        cell.dataset.day = String(dayIndex);
        // add stamp if present
        if (monthStamps.includes(dayIndex)) {
          cell.classList.add('stamp');
        }
      } else {
        cell.classList.add('empty');
        cell.textContent = '';
      }
      calendarGrid.appendChild(cell);
    }
  }

  // ---------- 목표 UI 렌더 및 관리 ----------
  function formatHours(hours) {
    // hours can be fractional
    const totalSec = Math.round(hours * 3600);
    return formatTime(totalSec);
  }

  function computeDailySecondsForGoal(goal) {
    if (!goal) return 0;
    if (goal.type !== 'hours') return 0;
    const start = goal.start ? new Date(goal.start) : new Date();
    const end = goal.end ? new Date(goal.end) : new Date();
    const msPerDay = 24 * 3600 * 1000;
    const days = Math.max(1, Math.floor((end.setHours(0,0,0,0) - start.setHours(0,0,0,0)) / msPerDay) + 1);
    const totalHours = Number(goal.totalHours) || 0;
    return Math.ceil((totalHours * 3600) / days);
  }

  function renderGoalsList() {
    const listEl = document.getElementById('goalsList');
    if (!listEl) return;
    const goals = loadGoalsForUser();
    listEl.innerHTML = '';
    if (!goals.length) {
      listEl.textContent = '저장된 목표가 없습니다.';
      return;
    }
    const activeId = getActiveGoalIdForUser();
    goals.forEach(g => {
      const el = document.createElement('div');
      el.className = 'goal-item';
      const title = document.createElement('div');
      title.textContent = g.title + (g.type === 'hours' ? ` — 총 ${g.totalHours}시간 (${g.start} ~ ${g.end})` : ` — ${g.targetDesc || ''}`);
      const btns = document.createElement('div');
      btns.style.marginTop = '6px';
      const trackBtn = document.createElement('button');
      trackBtn.textContent = activeId === g.id ? '활성화 중' : '트래킹';
      trackBtn.disabled = activeId === g.id;
      trackBtn.addEventListener('click', () => {
        setActiveGoalIdForUser(g.id);
        renderGoalsList();
        renderActiveGoalInfo();
      });
      const delBtn = document.createElement('button');
      delBtn.textContent = '삭제';
      delBtn.addEventListener('click', () => {
        const arr = loadGoalsForUser().filter(x => x.id !== g.id);
        saveGoalsForUser(arr);
        if (getActiveGoalIdForUser() === g.id) setActiveGoalIdForUser(null);
        renderGoalsList();
        renderActiveGoalInfo();
      });
      btns.appendChild(trackBtn);
      btns.appendChild(delBtn);
      el.appendChild(title);
      el.appendChild(btns);
      listEl.appendChild(el);
    });
  }

  function renderActiveGoalInfo() {
    const info = document.getElementById('activeGoalInfo');
    if (!info) return;
    const goals = loadGoalsForUser();
    const activeId = getActiveGoalIdForUser();
    const goal = goals.find(g => g.id === activeId);
    if (!goal) {
      info.textContent = '활성화된 목표가 없습니다.';
      return;
    }
    if (goal.type === 'hours') {
      const dailySec = computeDailySecondsForGoal(goal);
      const todaySecs = seconds; // `seconds` already reflects today's accumulated seconds
      const percent = dailySec > 0 ? Math.min(100, Math.round((todaySecs / dailySec) * 100)) : 0;
      info.innerHTML = `${goal.title} — 기간: ${goal.start} ~ ${goal.end} / 총 ${goal.totalHours}시간<br>하루 목표: ${formatTime(dailySec)} / 오늘 진행: ${formatTime(todaySecs)} (${percent}%)`;
    } else {
      info.textContent = `${goal.title} — ${goal.targetDesc || ''}`;
    }
  }

  function markDay(year, month, day) {
    const stamps = loadStamps();
    const key = getCalendarKey(year, month);
    stamps[key] = stamps[key] || [];
    if (!stamps[key].includes(day)) {
      stamps[key].push(day);
      saveStamps(stamps);
      // update visible cell if calendar showing same month
      const showing = calendarYear === year && calendarMonth === month;
      if (showing && calendarGrid) {
        const cells = calendarGrid.querySelectorAll('.day');
        cells.forEach(c => {
          if (c.dataset.day && Number(c.dataset.day) === day) c.classList.add('stamp');
        });
      }
    }
  }

  function markTodayAchieved() {
    const today = new Date();
    markDay(today.getFullYear(), today.getMonth(), today.getDate());
  }

  // 초기 렌더: 현재 달
  let today = new Date();
  let calendarYear = today.getFullYear();
  let calendarMonth = today.getMonth();
  renderCalendar(calendarYear, calendarMonth);

  // 초기 로드 시 오늘까지 저장된 시간 불러오기
  seconds = getSavedSecondsForDate(today.getFullYear(), today.getMonth(), today.getDate());
  if (timeDisplay) timeDisplay.textContent = formatTime(seconds);

  // 캘린더에서 날짜 클릭하면 해당 날짜 공부시간 표시
  if (calendarGrid) {
    const infoBox = document.getElementById('selectedDateInfo');
    calendarGrid.addEventListener('click', (e) => {
      const cell = e.target.closest('.day');
      if (!cell || !cell.dataset.day) return;
      const day = Number(cell.dataset.day);
      const secs = getSavedSecondsForDate(calendarYear, calendarMonth, day);
      if (infoBox) {
        infoBox.textContent = `${calendarYear}년 ${calendarMonth + 1}월 ${day}일 공부시간: ${formatTime(secs)}`;
      }
      // 선택 시 시각적으로 표시 (선택 클래스)
      calendarGrid.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
      cell.classList.add('selected');
    });
  }

  // 목표 생성 폼 처리
  const createForm = document.getElementById('createGoalForm');
  if (createForm) {
    const typeSel = document.getElementById('goalType');
    const hoursFields = document.getElementById('typeHoursFields');
    const targetFields = document.getElementById('typeTargetFields');
    typeSel.addEventListener('change', () => {
      if (typeSel.value === 'hours') { hoursFields.style.display = ''; targetFields.style.display = 'none'; }
      else { hoursFields.style.display = 'none'; targetFields.style.display = ''; }
    });

    createForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('goalTitle').value.trim();
      const type = document.getElementById('goalType').value;
      const goals = loadGoalsForUser();
      const id = 'g_' + Date.now();
      if (type === 'hours') {
        const totalHours = Number(document.getElementById('goalTotalHours').value) || 0;
        const start = document.getElementById('goalStartDate').value || (new Date()).toISOString().slice(0,10);
        const end = document.getElementById('goalEndDate').value || start;
        goals.push({ id, type: 'hours', title, totalHours, start, end });
      } else {
        const desc = document.getElementById('goalTargetDesc').value.trim();
        goals.push({ id, type: 'target', title, targetDesc: desc });
      }
      saveGoalsForUser(goals);
      renderGoalsList();
      createForm.reset();
      document.getElementById('goalType').dispatchEvent(new Event('change'));
    });
  }

  // prev/next buttons
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const monthLabel = document.getElementById('monthLabel');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    calendarMonth -= 1;
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear -= 1; }
    renderCalendar(calendarYear, calendarMonth);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    calendarMonth += 1;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear += 1; }
    renderCalendar(calendarYear, calendarMonth);
  });

  // 메뉴 클릭으로 화면 전환
  if (menuCalendar && menuTimer) {
    menuCalendar.addEventListener('click', () => {
      menuCalendar.classList.add('active');
      menuTimer.classList.remove('active');
      if (timerSection) timerSection.classList.add('hidden');
      if (calendarSection) calendarSection.classList.remove('hidden');
    });
    menuTimer.addEventListener('click', () => {
      menuTimer.classList.add('active');
      menuCalendar.classList.remove('active');
      if (calendarSection) calendarSection.classList.add('hidden');
      if (timerSection) timerSection.classList.remove('hidden');
    });
  }

  // ---------- 타이머 목표 달성 체크 ----------
  function getGoalSeconds() {
    const h = Number(document.getElementById('goalHour')?.value || 0);
    const m = Number(document.getElementById('goalMin')?.value || 0);
    return h * 3600 + m * 60;
  }

  let goalMarkedToday = false;

  function checkGoalReached() {
    const goal = getGoalSeconds();
    if (goal <= 0) return;
    if (seconds >= goal && !goalMarkedToday) {
      goalMarkedToday = true;
      // 목표 달성 시 저장 및 스탬프 표시
      if (today) setSavedSecondsForDate(today.getFullYear(), today.getMonth(), today.getDate(), seconds);
      markTodayAchieved();
      alert('오늘 목표를 달성하여 달력에 스탬프가 찍혔습니다.');
    }
  }

  // reset goalMarkedToday when date changes or when timer reset
  setInterval(() => {
    const now = new Date();
    if (now.getDate() !== today.getDate()) {
      goalMarkedToday = false;
      // 날짜가 바뀌면 today 업데이트하고 그날 저장된 시간으로 초기화
      today = now;
      seconds = getSavedSecondsForDate(today.getFullYear(), today.getMonth(), today.getDate());
      if (timeDisplay) timeDisplay.textContent = formatTime(seconds);
    }
  }, 60 * 1000);
