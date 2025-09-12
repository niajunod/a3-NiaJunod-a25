let currentUser = null;

// --- AUTH ---
document.querySelector('#loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        currentUser = await res.json();
        document.querySelector('#nav-username').textContent = `Welcome, ${currentUser.username}`;
        document.querySelector('#login-card').classList.add('d-none');
        document.querySelector('#logoutBtn').classList.remove('d-none');
        document.querySelector('#app').classList.remove('d-none');
        loadShifts();
    } else {
        alert('❌ Login failed');
    }
});

document.querySelector('#logoutBtn')?.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    currentUser = null;
    document.querySelector('#nav-username').textContent = '';
    document.querySelector('#login-card').classList.remove('d-none');
    document.querySelector('#logoutBtn').classList.add('d-none');
    document.querySelector('#app').classList.add('d-none');
});

// --- SHIFTS ---
async function loadShifts() {
    const res = await fetch('/api/shifts');
    const shifts = await res.json();

    const body = document.querySelector('#shiftsBody');
    body.innerHTML = '';

    let totalTips = 0, totalHours = 0;

    shifts.forEach(shift => {
        totalTips += shift.tips;
        totalHours += shift.hours;

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${shift.restaurant}</td>
      <td>${shift.hours}</td>
      <td>${shift.tips.toFixed(2)}</td>
      <td>${(shift.tips / shift.hours).toFixed(2)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editShift('${shift._id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteShift('${shift._id}')">Delete</button>
      </td>
    `;
        body.appendChild(row);
    });

    // update stats
    document.querySelector('#count').textContent = shifts.length;
    document.querySelector('#totalTips').textContent = totalTips.toFixed(2);
    document.querySelector('#avg').textContent = totalHours > 0 ? (totalTips / totalHours).toFixed(2) : "—";
}

document.querySelector('#shiftForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.querySelector('#shiftId').value;
    const restaurant = document.querySelector('#restaurant').value;
    const hours = parseFloat(document.querySelector('#hours').value);
    const tips = parseFloat(document.querySelector('#tips').value);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/shifts/${id}` : '/api/shifts';

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant, hours, tips })
    });

    if (res.ok) {
        clearForm();
        loadShifts();
    }
});

async function deleteShift(id) {
    await fetch(`/api/shifts/${id}`, { method: 'DELETE' });
    loadShifts();
}

async function editShift(id) {
    const res = await fetch(`/api/shifts/${id}`);
    if (!res.ok) return;
    const shift = await res.json();

    document.querySelector('#shiftId').value = shift._id;
    document.querySelector('#restaurant').value = shift.restaurant;
    document.querySelector('#hours').value = shift.hours;
    document.querySelector('#tips').value = shift.tips;
}

document.querySelector('#clearBtn')?.addEventListener('click', clearForm);

function clearForm() {
    document.querySelector('#shiftId').value = '';
    document.querySelector('#shiftForm').reset();
}
