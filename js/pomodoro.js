// ==================== Pomodoro Timer ====================

let pomodoroInterval = null;
let pomodoroSeconds = 25 * 60;
let pomodoroRunning = false;
let pomodoroMode = 'work'; // 'work', 'break', 'longbreak'
let pomodoroCount = 0;
let pomodoroTotalWork = parseInt(localStorage.getItem('pomodoroTotalWork') || '0');

const pomodoroDefaults = {
    work: 25 * 60,
    break: 5 * 60,
    longbreak: 15 * 60
};

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return m + ':' + s;
}

function updatePomodoroDisplay() {
    const display = document.getElementById('pomodoroTime');
    const modeLabel = document.getElementById('pomodoroModeLabel');
    const startBtn = document.getElementById('pomodoroStartBtn');
    const progress = document.getElementById('pomodoroProgress');

    if (display) display.textContent = formatTime(pomodoroSeconds);

    if (modeLabel) {
        if (pomodoroMode === 'work') modeLabel.textContent = t('pomo.mode.work');
        else if (pomodoroMode === 'break') modeLabel.textContent = t('pomo.mode.break');
        else modeLabel.textContent = t('pomo.mode.longbreak');
    }

    if (startBtn) {
        startBtn.textContent = pomodoroRunning ? t('pomo.btn.pause') : t('pomo.btn.start');
    }

    // Update circular progress
    if (progress) {
        const total = pomodoroDefaults[pomodoroMode];
        const pct = 1 - (pomodoroSeconds / total);
        const circumference = 2 * Math.PI * 140;
        progress.style.strokeDasharray = circumference;
        progress.style.strokeDashoffset = circumference * (1 - pct);
    }

    // Update page title when running
    if (pomodoroRunning) {
        document.title = formatTime(pomodoroSeconds) + ' - ' + t('pomo.heading');
    }

    // Update stats
    const countEl = document.getElementById('pomodoroCountDisplay');
    const totalEl = document.getElementById('pomodoroTotalDisplay');
    if (countEl) countEl.textContent = pomodoroCount;
    if (totalEl) totalEl.textContent = Math.floor(pomodoroTotalWork / 60) + ' ' + t('pomo.minutes');
}

function togglePomodoro() {
    if (pomodoroRunning) {
        pausePomodoro();
    } else {
        startPomodoro();
    }
}

function startPomodoro() {
    pomodoroRunning = true;
    pomodoroInterval = setInterval(function() {
        pomodoroSeconds--;
        if (pomodoroSeconds <= 0) {
            clearInterval(pomodoroInterval);
            pomodoroRunning = false;
            pomodoroComplete();
        }
        updatePomodoroDisplay();
    }, 1000);
    updatePomodoroDisplay();
}

function pausePomodoro() {
    pomodoroRunning = false;
    clearInterval(pomodoroInterval);
    updatePomodoroDisplay();
}

function resetPomodoro() {
    pausePomodoro();
    pomodoroSeconds = pomodoroDefaults[pomodoroMode];
    updatePomodoroDisplay();
    // Reset page title
    document.title = t('site.title') || 'Research Tools Hub';
}

function pomodoroComplete() {
    // Play notification sound using Web Audio API
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        [0, 200, 400].forEach(function(delay) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = 800;
            osc.type = 'sine';
            gain.gain.value = 0.3;
            osc.start(audioCtx.currentTime + delay / 1000);
            osc.stop(audioCtx.currentTime + delay / 1000 + 0.15);
        });
    } catch(e) {}

    if (pomodoroMode === 'work') {
        pomodoroCount++;
        pomodoroTotalWork += pomodoroDefaults.work;
        localStorage.setItem('pomodoroTotalWork', pomodoroTotalWork.toString());
        showToast(t('pomo.workDone'), 'success');

        // Every 4 pomodoros, take a long break
        if (pomodoroCount % 4 === 0) {
            switchPomodoroMode('longbreak');
        } else {
            switchPomodoroMode('break');
        }
    } else {
        showToast(t('pomo.breakDone'), 'info');
        switchPomodoroMode('work');
    }

    // Browser notification
    if (Notification.permission === 'granted') {
        new Notification(pomodoroMode === 'work' ? t('pomo.breakDone') : t('pomo.workDone'));
    }
}

function switchPomodoroMode(mode) {
    pausePomodoro();
    pomodoroMode = mode;
    pomodoroSeconds = pomodoroDefaults[mode];

    // Update mode button styles
    document.querySelectorAll('.pomo-mode-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update ring color
    const progress = document.getElementById('pomodoroProgress');
    if (progress) {
        if (mode === 'work') progress.style.stroke = '#e74c3c';
        else if (mode === 'break') progress.style.stroke = '#27ae60';
        else progress.style.stroke = '#3498db';
    }

    updatePomodoroDisplay();
}

function setCustomTime() {
    const input = document.getElementById('pomodoroCustomMinutes');
    if (!input) return;
    const minutes = parseInt(input.value);
    if (isNaN(minutes) || minutes < 1 || minutes > 120) {
        showToast(t('pomo.invalidTime'), 'warning');
        return;
    }
    pomodoroDefaults[pomodoroMode] = minutes * 60;
    resetPomodoro();
    showToast(t('pomo.timeSet') + ' ' + minutes + ' ' + t('pomo.minutes'));
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function resetPomodoroStats() {
    if (confirm(t('pomo.resetConfirm'))) {
        pomodoroCount = 0;
        pomodoroTotalWork = 0;
        localStorage.setItem('pomodoroTotalWork', '0');
        updatePomodoroDisplay();
        showToast(t('pomo.statsReset'));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updatePomodoroDisplay();
    requestNotificationPermission();
});
