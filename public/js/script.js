// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const loginCard = document.getElementById('login-card');
    const appSection = document.getElementById('app');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const navUsername = document.getElementById('nav-username');

    const shiftsBody = document.getElementById('shiftsBody');
    const shiftForm = document.getElementById('shiftForm');
    const shiftIdInput = document.getElementById('shiftId');
    const restaurantInput = document.getElementById('restaurant');
    const hoursInput = document.getElementById('hours');
    const tipsInput = document.getElementById('tips');
    const avgEl = document.getElementById('avg');
    const totalTipsEl = document.getElementById('totalTips');
    const countEl = document.getElementById('count');
    const clearBtn = document.getElementById('clearBtn');

    async function api(path, opts = {}) {
        opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
        if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
        const res = await fetch(path, opts);
        const json = await res.json().catch(()=> ({}));
        if (!res.ok) throw { status: res.status, body: json };
        return json;
    }

    async function checkLogin() {
        try {
            const data = await api('/api/me');
            if (data.loggedIn) {
                loginCard.classList.add('d-none');
                appSection.classList.remove('d-none');
                logoutBtn.classList.remove('d-none');
                navUsername.textContent = data.user.username;
                loadShifts();
            } else {
                loginCard.classList.remove('d-none');
                appSection.classList.add('d-none');
                logoutBtn.classList.add('d-none');
                navUsername.textContent = '';
            }
        } catch (err) {
            console.error(err);
            loginCard.classList.remove('d-none');
            appSection.classList.add('d-none');
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        if (!username || !password) return;
        try {
            const res = await api('/api/login', { method: 'POST', body: { username, password } });
            if (res.created) alert('Account created and logged in.');
            await checkLogin();
        } catch (err) {
            if (err.body && err.body.error) alert(err.body.error);
            else alert('Login failed');
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            await api('/api/logout', { method: 'POST' });
            location.reload();
        } catch (err) {
            console.error(err);
            alert('Logout failed');
        }
    });

    async function loadShifts() {
        try {
            const data = await api('/api/shifts');
            renderShifts(data.shifts || []);
            updateStats(data.shifts || []);
        } catch (err) {
            console.error(err);
            alert('Failed to load shifts');
        }
    }

    function renderShifts(shifts) {
        shiftsBody.innerHTML = '';
        shifts.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${escapeHtml(s.restaurant)}</td>
        <td>${s.hours}</td>
        <td>${s.tips.toFixed(2)}</td>
        <td>${(s.dollarsPerHour ?? 0).toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" data-id="${s._id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${s._id}">Delete</button>
        </td>
      `;
            shiftsBody.appendChild(tr);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const row = shifts.find(x => x._id === id);
                if (!row) return;
                shiftIdInput.value = row._id;
                restaurantInput.value = row.restaurant;
                hoursInput.value = row.hours;
                tipsInput.value = row.tips;
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Delete this shift?')) return;
                try {
                    await api(`/api/shifts/${btn.dataset.id}`, { method: 'DELETE' });
                    loadShifts();
                } catch (err) {
                    console.error(err);
                    alert('Delete failed');
                }
            });
        });
    }

    shiftForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            restaurant: restaurantInput.value.trim(),
            hours: Number(hoursInput.value),
            tips: Number(tipsInput.value)
        };
        if (!payload.restaurant) return alert('Please enter a restaurant');
        try {
            if (shiftIdInput.value) {
                await api(`/api/shifts/${shiftIdInput.value}`, { method: 'PUT', body: payload });
            } else {
                await api('/api/shifts', { method: 'POST', body: payload });
            }
            clearForm();
            loadShifts();
        } catch (err) {
            console.error(err);
            alert('Save failed');
        }
    });

    clearBtn.addEventListener('click', clearForm);
    function clearForm() {
        shiftIdInput.value = '';
        restaurantInput.value = '';
        hoursInput.value = '';
        tipsInput.value = '';
    }

    function updateStats(shifts) {
        const tips = shifts.map(s => s.tips || 0);
        const hours = shifts.map(s => s.hours || 0);
        const totalTips = tips.reduce((a,b) => a + b, 0);
        const avg = hours.reduce((a,b,i) => a + (b>0? (tips[i]/b) : 0), 0);
        const avgPerShift = shifts.length ? (avg / shifts.length) : 0;
        avgEl.textContent = shifts.length ? ( (shifts.reduce((a,s)=> a + (s.dollarsPerHour||0),0) / shifts.length).toFixed(2) ) : '—';
        totalTipsEl.textContent = totalTips.toFixed(2);
        countEl.textContent = shifts.length;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function(m) {
            return ({ '&': '&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#39;' })[m];
        });
    }

    checkLogin();
});
