const BIRTH_DATE = new Date('2026-06-12');
const HOME_DATE = new Date('2026-10-07');

let records = [
    { date: '2026-10-15', weight: 1.87 },
    { date: '2026-10-22', weight: 2.00 },
    { date: '2026-10-27', weight: 2.13 }
];

const STORAGE_KEY = 'bobi_weight_records';

function loadRecords() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            records = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load records', e);
        }
    }
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function calcAge(birthDate) {
    const now = new Date();
    let months = (now.getFullYear() - birthDate.getFullYear()) * 12;
    months += now.getMonth() - birthDate.getMonth();
    if (now.getDate() < birthDate.getDate()) months--;
    const years = Math.floor(months / 12);
    const remainMonths = months % 12;
    if (years > 0) return `${years} 岁 ${remainMonths} 个月`;
    const days = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24));
    return `${days} 天`;
}

function calcDaysAtHome(homeDate) {
    const now = new Date();
    return Math.floor((now - homeDate) / (1000 * 60 * 60 * 24));
}

function updateProfile() {
    document.getElementById('age').textContent = calcAge(BIRTH_DATE);
    document.getElementById('days-at-home').textContent = calcDaysAtHome(HOME_DATE) + ' 天';
}

function updateTable() {
    const tbody = document.getElementById('weight-tbody');
    tbody.innerHTML = '';
    records.forEach((r, i) => {
        const prevWeight = i > 0 ? records[i - 1].weight : null;
        const growth = prevWeight !== null ? (r.weight - prevWeight).toFixed(2) : '-';
        const growthClass = growth !== '-' && parseFloat(growth) > 0 ? 'grow-positive' : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.date}</td>
            <td>${r.weight.toFixed(2)}</td>
            <td class="${growthClass}">${growth !== '-' ? '+' + growth : '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateStats() {
    if (records.length === 0) return;
    const first = records[0].weight;
    const last = records[records.length - 1].weight;
    document.getElementById('initial-weight').textContent = first.toFixed(2) + ' kg';
    document.getElementById('current-weight').textContent = last.toFixed(2) + ' kg';
    document.getElementById('gain-weight').textContent = '+' + (last - first).toFixed(2) + ' kg';
}

let chart = null;
function updateChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    const labels = records.map(r => r.date.slice(5));
    const data = records.map(r => r.weight);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '体重 (kg)',
                data: data,
                borderColor: '#ff8c42',
                backgroundColor: 'rgba(255, 140, 66, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#ff8c42',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 140, 66, 0.9)',
                    titleFont: { family: 'Noto Sans SC' },
                    bodyFont: { family: 'Noto Sans SC' },
                    callbacks: {
                        label: (ctx) => ` 体重: ${ctx.parsed.y} kg`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#8b7355', font: { family: 'Noto Sans SC' } }
                },
                y: {
                    grid: { color: '#ffe4cc' },
                    ticks: {
                        color: '#8b7355',
                        font: { family: 'Noto Sans SC' },
                        callback: v => v + ' kg'
                    }
                }
            }
        }
    });
}

function render() {
    updateProfile();
    updateStats();
    updateTable();
    updateChart();
}

document.getElementById('add-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const weight = parseFloat(document.getElementById('weight').value);
    if (!date || isNaN(weight) || weight <= 0) return;
    records.push({ date, weight });
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveRecords();
    render();
    document.getElementById('add-form').reset();
});

window.addEventListener('DOMContentLoaded', () => {
    loadRecords();
    render();
});
