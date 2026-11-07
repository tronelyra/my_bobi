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
        try { records = JSON.parse(saved); } catch (e) {}
    }
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function daysBetween(a, b) {
    return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

function calcAge(birthDate) {
    const now = new Date();
    let months = (now.getFullYear() - birthDate.getFullYear()) * 12;
    months += now.getMonth() - birthDate.getMonth();
    if (now.getDate() < birthDate.getDate()) months--;
    const years = Math.floor(months / 12);
    const remainMonths = months % 12;
    if (years > 0) return `${years}岁${remainMonths}月`;
    return daysBetween(birthDate, now) + '天';
}

function calcNextBirthday(birthDate) {
    const now = new Date();
    let next = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (next <= now) next = new Date(now.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
    const days = daysBetween(now, next);
    return days === 0 ? '🎂 今天!' : `${days} 天`;
}

function updateHero() {
    document.getElementById('hero-age').textContent = calcAge(BIRTH_DATE);
    document.getElementById('hero-days').innerHTML = daysBetween(HOME_DATE, new Date()) + '<span class="unit">天</span>';
    const last = records[records.length - 1];
    document.getElementById('hero-weight').innerHTML = (last ? last.weight.toFixed(2) : '-') + '<span class="unit">kg</span>';
}

function updateSide() {
    document.getElementById('next-birthday').textContent = calcNextBirthday(BIRTH_DATE);

    if (records.length >= 2) {
        const first = records[0].weight;
        const last = records[records.length - 1].weight;
        const gained = last - first;
        document.getElementById('gain-kg').textContent = '+' + gained.toFixed(2) + ' kg';
        document.getElementById('gain-pct').textContent = '+' + ((gained / first) * 100).toFixed(1) + '%';

        const firstDate = new Date(records[0].date);
        const lastDate = new Date(records[records.length - 1].date);
        const span = daysBetween(firstDate, lastDate);
        if (span > 0) {
            document.getElementById('avg-daily').textContent = (gained * 1000 / span).toFixed(0) + ' g';
        } else {
            document.getElementById('avg-daily').textContent = '-';
        }
    } else {
        document.getElementById('gain-kg').textContent = '-';
        document.getElementById('gain-pct').textContent = '-';
        document.getElementById('avg-daily').textContent = '-';
    }
}

function updateTable() {
    const tbody = document.getElementById('weight-tbody');
    tbody.innerHTML = '';
    document.getElementById('record-count').textContent = `共 ${records.length} 条记录`;

    let totalGrowth = 0;
    const growths = [];
    records.forEach((r, i) => {
        if (i === 0) { growths.push(0); return; }
        const g = r.weight - records[i - 1].weight;
        growths.push(g);
        if (g > 0) totalGrowth += g;
    });

    records.forEach((r, i) => {
        const g = growths[i];
        const growStr = i === 0 ? '—' : (g >= 0 ? '+' + g.toFixed(2) : g.toFixed(2));
        const growClass = g > 0 ? 'grow-positive' : '';
        const pct = i === 0 || totalGrowth <= 0 ? 0 : Math.max(0, (g / totalGrowth) * 100);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.date}</td>
            <td>${r.weight.toFixed(2)} kg</td>
            <td class="${growClass}">${growStr}</td>
            <td class="bar-cell">
                <div class="bar-wrap">
                    <div class="bar-fill" style="width: ${pct}%"></div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

let chart = null;
function updateChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    const labels = records.map(r => r.date.slice(5));
    const data = records.map(r => r.weight);

    if (chart) chart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, 'rgba(255, 140, 66, 0.35)');
    gradient.addColorStop(1, 'rgba(255, 140, 66, 0.02)');

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '体重 (kg)',
                data: data,
                borderColor: '#ff8c42',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#ff8c42',
                pointBorderWidth: 2.5,
                pointRadius: 6,
                pointHoverRadius: 9,
                pointHoverBackgroundColor: '#ff8c42'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(61, 44, 30, 0.92)',
                    titleFont: { family: 'Noto Sans SC', size: 12 },
                    bodyFont: { family: 'Noto Sans SC', size: 13, weight: 'bold' },
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false,
                    callbacks: {
                        label: (ctx) => `⚖️  ${ctx.parsed.y.toFixed(2)} kg`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#b5a08a',
                        font: { family: 'Noto Sans SC', size: 11 }
                    },
                    border: { display: false }
                },
                y: {
                    grid: {
                        color: '#fff0e0',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#8b7355',
                        font: { family: 'Noto Sans SC', size: 11 },
                        callback: v => v.toFixed(2)
                    },
                    border: { display: false }
                }
            }
        }
    });
}

const quotes = [
    '波比，愿你每一天都健康、快乐、被爱包围 💛',
    '毛茸茸的小家伙，你是家里最暖的存在 🧡',
    '慢慢长大，不急，我们陪你 🐾',
    '你给的每一个眼神，都是最好的礼物 ✨',
    '世界很大，但你的小世界有我守护 🏠'
];

function pickQuote() {
    const day = new Date().getDate();
    document.getElementById('quote-text').textContent = quotes[day % quotes.length];
}

function render() {
    updateHero();
    updateSide();
    updateTable();
    updateChart();
    pickQuote();
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
    this.reset();
});

window.addEventListener('DOMContentLoaded', () => {
    loadRecords();
    render();
});
