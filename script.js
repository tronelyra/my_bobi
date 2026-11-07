const BIRTH_DATE = new Date('2026-06-12');
const HOME_DATE = new Date('2026-10-07');
const GENDER = 'male';

const records = [
    { date: '2026-10-15', weight: 1.87 },
    { date: '2026-10-22', weight: 2.00 },
    { date: '2026-10-27', weight: 2.13 },
    { date: '2026-11-07', weight: 2.25 }
];

records.sort((a, b) => new Date(a.date) - new Date(b.date));

const vaccines = [
    { name: '妙三多（猫三联）', date: '2026-09-28', dose: 1, note: '首免' },
    { name: '妙三多（猫三联）', date: '2026-10-18', dose: 2, note: '二免' },
];

const dewormRecords = {
    internal: [],
    external: []
};

const BRITISH_STD = {
    male: [
        { month: 0,  min: 0.09, max: 0.14, avg: 0.11 },
        { month: 1,  min: 0.45, max: 0.70, avg: 0.58 },
        { month: 2,  min: 0.95, max: 1.40, avg: 1.18 },
        { month: 3,  min: 1.50, max: 2.20, avg: 1.85 },
        { month: 4,  min: 2.10, max: 2.80, avg: 2.45 },
        { month: 5,  min: 2.55, max: 3.40, avg: 2.98 },
        { month: 6,  min: 3.00, max: 4.20, avg: 3.60 },
        { month: 7,  min: 3.30, max: 4.70, avg: 4.00 },
        { month: 8,  min: 3.60, max: 5.20, avg: 4.40 },
        { month: 9,  min: 3.80, max: 5.50, avg: 4.65 },
        { month: 10, min: 4.00, max: 5.80, avg: 4.90 },
        { month: 11, min: 4.25, max: 6.10, avg: 5.18 },
        { month: 12, min: 4.50, max: 6.40, avg: 5.45 },
        { month: 18, min: 4.90, max: 7.20, avg: 6.05 },
        { month: 24, min: 5.20, max: 7.50, avg: 6.35 },
        { month: 36, min: 5.50, max: 8.50, avg: 7.00 }
    ],
    female: [
        { month: 0,  min: 0.08, max: 0.13, avg: 0.10 },
        { month: 1,  min: 0.40, max: 0.65, avg: 0.53 },
        { month: 2,  min: 0.85, max: 1.25, avg: 1.05 },
        { month: 3,  min: 1.30, max: 1.90, avg: 1.60 },
        { month: 4,  min: 1.80, max: 2.40, avg: 2.10 },
        { month: 5,  min: 2.15, max: 2.90, avg: 2.53 },
        { month: 6,  min: 2.50, max: 3.40, avg: 2.95 },
        { month: 7,  min: 2.70, max: 3.65, avg: 3.18 },
        { month: 8,  min: 2.90, max: 3.90, avg: 3.40 },
        { month: 9,  min: 3.05, max: 4.10, avg: 3.58 },
        { month: 10, min: 3.20, max: 4.30, avg: 3.75 },
        { month: 11, min: 3.35, max: 4.55, avg: 3.95 },
        { month: 12, min: 3.50, max: 4.80, avg: 4.15 },
        { month: 18, min: 3.65, max: 5.00, avg: 4.33 },
        { month: 24, min: 3.80, max: 5.20, avg: 4.50 },
        { month: 36, min: 4.00, max: 5.50, avg: 4.75 }
    ]
};

const GROWTH_STAGES = [
    { maxMonth: 2,  name: '新生哺乳期', note: '每日健康增重 10-15g，快速发育' },
    { maxMonth: 4,  name: '幼猫社会化期', note: '骨骼快速拉长拔节，免疫接种关键期' },
    { maxMonth: 6,  name: '骨骼高峰期',   note: '恒齿替换完成，达到成年体重 60-70%' },
    { maxMonth: 8,  name: '青春期转折',   note: '纵向定型、胸廓横向拓宽，肌肉增粗' },
    { maxMonth: 12, name: '青年成熟期',   note: '纵向骨骼发育基本完成，体态初显敦实' },
    { maxMonth: 24, name: '骨密度提升期', note: '核心骨密度持续提升，公猫腮部丰满爆开' },
    { maxMonth: 36, name: '完全成熟期',   note: '骨骼肌肉系统完全成熟，达到 Cobby 体态巅峰' }
];

function daysBetween(a, b) {
    return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

function calcMonthFromBirth(date) {
    const months = (date.getFullYear() - BIRTH_DATE.getFullYear()) * 12
                 + (date.getMonth() - BIRTH_DATE.getMonth());
    const dayDiff = date.getDate() - BIRTH_DATE.getDate();
    return months + dayDiff / 30.4375;
}

function lookupStd(month) {
    const table = BRITISH_STD[GENDER];
    if (month <= table[0].month) return { ...table[0] };
    if (month >= table[table.length - 1].month) return { ...table[table.length - 1] };
    for (let i = 0; i < table.length - 1; i++) {
        const a = table[i], b = table[i + 1];
        if (month >= a.month && month <= b.month) {
            const t = (month - a.month) / (b.month - a.month);
            return {
                min: a.min + (b.min - a.min) * t,
                max: a.max + (b.max - a.max) * t,
                avg: a.avg + (b.avg - a.avg) * t
            };
        }
    }
    return { min: 0, max: 0, avg: 0 };
}

function evalWeight(weight, std) {
    if (weight < std.min) {
        const pct = ((std.min - weight) / std.min * 100);
        return { status: 'under', label: '偏瘦', color: '#4ab8ff', diff: -(std.min - weight), pct };
    }
    if (weight > std.max) {
        const pct = ((weight - std.max) / std.max * 100);
        return { status: 'over', label: '偏胖', color: '#f472b6', diff: weight - std.max, pct };
    }
    const mid = (std.min + std.max) / 2;
    const deviation = Math.abs(weight - mid) / ((std.max - std.min) / 2) * 50;
    let label = '标准';
    if (deviation > 30) label = '标准偏低';
    if (weight > mid && deviation > 30) label = '标准偏高';
    return { status: 'normal', label, color: '#10b981', diff: 0, pct: 0 };
}

function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d;
}

function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function daysFromToday(dateStr) {
    return daysBetween(new Date(), new Date(dateStr));
}

const VACCINE_INTERVAL_DAYS = 28;
const RABIES_MIN_GAP_DAYS = 7;

function computeVaccineSchedule() {
    const now = new Date();
    const schedule = [];

    const triadDates = vaccines.filter(v => v.name.includes('三联') || v.name.includes('妙三多'))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const hasRabies = vaccines.some(v => v.name.includes('狂犬'));

    if (triadDates.length === 0) {
        const first = addDays(formatDate(BIRTH_DATE), 56);
        schedule.push({
            type: 'triad', label: '妙三多 第1针 (首免)',
            due: formatDate(first), status: 'overdue',
            note: '建议 8 周龄开始基础免疫',
            urgent: true
        });
    } else if (triadDates.length < 3) {
        const last = triadDates[triadDates.length - 1];
        const nextDate = addDays(last.date, VACCINE_INTERVAL_DAYS);
        const doseNum = triadDates.length + 1;
        const days = daysFromToday(formatDate(nextDate));

        let status, urgent = false;
        if (days < -7) { status = 'overdue'; urgent = true; }
        else if (days <= 7) { status = 'soon'; urgent = days < 0; }
        else { status = 'upcoming'; }

        schedule.push({
            type: 'triad', label: `妙三多 第${doseNum}针`,
            due: formatDate(nextDate), status, urgent,
            note: `上一针 ${last.date}，间隔 ${VACCINE_INTERVAL_DAYS} 天（WSAVA 推荐 3-4 周）`
        });

        if (doseNum === 3 && !hasRabies) {
            const rabiesDate = addDays(nextDate, RABIES_MIN_GAP_DAYS);
            const rDays = daysFromToday(formatDate(rabiesDate));
            let rStatus = 'upcoming';
            if (rDays < -7) { rStatus = 'overdue'; }
            else if (rDays <= 14) { rStatus = 'soon'; }
            schedule.push({
                type: 'rabies', label: '狂犬疫苗',
                due: formatDate(rabiesDate), status: rStatus,
                urgent: rStatus === 'overdue',
                note: '三联基础免疫完成后接种狂犬疫苗'
            });
        }
    } else {
        const last = triadDates[triadDates.length - 1];
        const annual = addDays(last.date, 365);
        const days = daysFromToday(formatDate(annual));
        let status = 'upcoming';
        if (days < -14) { status = 'overdue'; }
        else if (days <= 30) { status = 'soon'; }
        schedule.push({
            type: 'triad-annual', label: '妙三多 年度加强',
            due: formatDate(annual), status, urgent: status === 'overdue',
            note: `上一针 ${last.date}，每年加强一次`
        });

        if (hasRabies) {
            const rabiesDates = vaccines.filter(v => v.name.includes('狂犬'));
            const lastR = rabiesDates[rabiesDates.length - 1];
            const rAnnual = addDays(lastR.date, 365);
            const rDays = daysFromToday(formatDate(rAnnual));
            let rStatus = 'upcoming';
            if (rDays < -14) { rStatus = 'overdue'; }
            else if (rDays <= 30) { rStatus = 'soon'; }
            schedule.push({
                type: 'rabies-annual', label: '狂犬疫苗 年度加强',
                due: formatDate(rAnnual), status: rStatus, urgent: rStatus === 'overdue',
                note: `上一针 ${lastR.date}，每年加强一次`
            });
        }
    }

    return schedule;
}

function computeDewormSchedule() {
    const now = new Date();
    const month = calcMonthFromBirth(now);
    const schedule = [];

    const triadDates = vaccines.filter(v => v.name.includes('三联') || v.name.includes('妙三多'));
    const isVaccineComplete = triadDates.length >= 3 && vaccines.some(v => v.name.includes('狂犬'));

    const lastInternal = dewormRecords.internal.length > 0
        ? dewormRecords.internal[dewormRecords.internal.length - 1] : null;
    const lastExternal = dewormRecords.external.length > 0
        ? dewormRecords.external[dewormRecords.external.length - 1] : null;

    let interval = 30;
    if (month < 3) interval = 14;
    else if (month < 6) interval = 30;
    else interval = 90;

    let vaccineTip = '';
    if (!isVaccineComplete && !lastInternal) {
        const lastTriad = triadDates.sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
        if (lastTriad) {
            const readyDate = formatDate(addDays(lastTriad.date, 14));
            vaccineTip = `建议 基础免疫完成后 1-2 周 再开始，预计 ${readyDate} 后`;
        } else {
            vaccineTip = '建议 基础免疫完成后 1-2 周 再开始';
        }
    }

    let nextInternalDate;
    if (!lastInternal) {
        nextInternalDate = formatDate(now);
    } else {
        nextInternalDate = formatDate(addDays(lastInternal, interval));
    }
    const iDays = daysFromToday(nextInternalDate);
    let iStatus = 'upcoming', iUrgent = false;
    if (!lastInternal) { iStatus = isVaccineComplete ? 'overdue' : 'upcoming'; iUrgent = isVaccineComplete; }
    else if (iDays < -3) { iStatus = 'overdue'; iUrgent = true; }
    else if (iDays <= 7) { iStatus = 'soon'; iUrgent = iDays < 0; }

    let iNote = lastInternal ? `上一次 ${lastInternal}` : `从未做过`;
    if (vaccineTip) iNote += `（${vaccineTip}）`;

    schedule.push({
        type: 'internal', label: '体内驱虫',
        due: nextInternalDate, status: iStatus, urgent: iUrgent,
        note: iNote
    });

    let nextExternalDate;
    if (!lastExternal) {
        nextExternalDate = formatDate(now);
    } else {
        nextExternalDate = formatDate(addDays(lastExternal, 30));
    }
    const eDays = daysFromToday(nextExternalDate);
    let eStatus = 'upcoming', eUrgent = false;
    if (!lastExternal) { eStatus = isVaccineComplete ? 'overdue' : 'upcoming'; eUrgent = isVaccineComplete; }
    else if (eDays < -3) { eStatus = 'overdue'; eUrgent = true; }
    else if (eDays <= 7) { eStatus = 'soon'; eUrgent = eDays < 0; }

    let eNote = lastExternal ? `上一次 ${lastExternal}` : '从未做过 — 每月一次';
    if (vaccineTip) eNote += `（${vaccineTip}）`;

    schedule.push({
        type: 'external', label: '体外驱虫',
        due: nextExternalDate, status: eStatus, urgent: eUrgent,
        note: eNote
    });

    return schedule;
}

function computeNeuterSchedule() {
    const now = new Date();
    const month = calcMonthFromBirth(now);
    const lastRecord = records.length > 0 ? records[records.length - 1] : null;
    const currentWeight = lastRecord ? lastRecord.weight : 0;

    const triadDates = vaccines.filter(v => v.name.includes('三联') || v.name.includes('妙三多'));
    const hasRabies = vaccines.some(v => v.name.includes('狂犬'));
    const triadComplete = triadDates.length >= 3;
    const vaccineComplete = triadComplete && hasRabies;

    const earliestMonth = 8;
    const minWeight = 3.0;

    const schedule = [];

    let blockers = [];
    if (!triadComplete) blockers.push('妙三多未完成（缺第 ' + (triadDates.length + 1) + ' 针）');
    if (!hasRabies) blockers.push('狂犬疫苗未打');
    if (currentWeight < minWeight) blockers.push(`当前 ${currentWeight.toFixed(2)}kg，需 ≥ ${minWeight}kg（英短体型较大）`);
    if (month < earliestMonth) blockers.push(`当前 ${month.toFixed(1)} 月龄，需 ≥ ${earliestMonth} 月龄（英短发育较晚）`);

    let earliestReady = null;
    const earliestByAge = addDays(formatDate(BIRTH_DATE), earliestMonth * 30);
    const earliestByVaccine = (() => {
        const lastTriad = triadDates.sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
        if (vaccineComplete) return addDays(formatDate(now), 14);
        if (lastTriad && triadComplete && !hasRabies) return null;
        if (lastTriad) return addDays(lastTriad.date, 14);
        return addDays(formatDate(now), 60);
    })();

    const candidates = [earliestByAge, earliestByVaccine].filter(d => d !== null);
    if (candidates.length > 0) {
        earliestReady = candidates.reduce((a, b) => new Date(a) > new Date(b) ? a : b);
    } else {
        earliestReady = addDays(formatDate(now), 60);
    }

    let neuterDate = formatDate(earliestReady);
    let status, urgent = false, label, note;

    if (blockers.length > 0) {
        status = 'upcoming';
        label = '绝育（去势手术）';
        note = '前置条件未满足：\n• ' + blockers.join('\n• ');
        note += `\n预计最早可手术时间：${neuterDate}`;
    } else {
        const monthF = calcMonthFromBirth(new Date(neuterDate));
        if (monthF <= 12) {
            status = 'soon';
            urgent = true;
            label = '绝育（去势手术）· 最佳窗口期';
            note = `满足所有条件！${monthF.toFixed(1)} 月龄，8-12 月是英短金渐层公猫黄金窗口（首次发情前，睾丸发育成熟）。建议尽快预约。`;
        } else if (monthF <= 18) {
            status = 'soon';
            label = '绝育（去势手术）· 建议尽快';
            note = `${monthF.toFixed(1)} 月龄，超过 1 岁但仍在一年半内，可以做。若已出现发情迹象（乱尿、嚎叫）请速约。`;
        } else {
            status = 'overdue';
            urgent = true;
            label = '绝育（去势手术）· 已超过 1.5 岁';
            note = `${monthF.toFixed(1)} 月龄，建议尽快安排。英短体型大，术前需做全套体检（血常规+生化+心超）评估麻醉风险。`;
        }
    }

    schedule.push({
        type: 'neuter', label,
        due: neuterDate, status, urgent, note
    });

    return schedule;
}

function updateHealthManageCard() {
    const vaccineList = document.getElementById('vaccine-list');

    const vHistory = vaccines.slice().reverse();
    vaccineList.innerHTML = vHistory.length > 0
        ? vHistory.map(v => `<div class="hm-history-item"><span class="hm-date">${v.date}</span><span class="hm-name">${v.name}${v.dose ? ' 第'+v.dose+'针' : ''}</span></div>`).join('')
        : '<div class="hm-empty">暂无疫苗记录</div>';

    const vacSchedule = computeVaccineSchedule();
    const vacNext = document.getElementById('vaccine-next');
    vacNext.innerHTML = vacSchedule.map(s => nextItemHTML(s)).join('');

    const dwSchedule = computeDewormSchedule();
    const dwNext = document.getElementById('deworm-next');
    dwNext.innerHTML = dwSchedule.map(s => nextItemHTML(s)).join('');

    const ntSchedule = computeNeuterSchedule();
    const ntNext = document.getElementById('neuter-next');
    if (ntNext) ntNext.innerHTML = ntSchedule.map(s => nextItemHTML(s)).join('');
}

function nextItemHTML(s) {
    const now = new Date();
    const due = new Date(s.due);
    const days = daysBetween(now, due);
    let daysLabel = '';
    if (days < 0) daysLabel = `已逾期 ${-days} 天`;
    else if (days === 0) daysLabel = '就是今天!';
    else daysLabel = `还有 ${days} 天`;

    const statusMap = {
        overdue: { cls: 'status-overdue', badge: '逾期' },
        soon: { cls: 'status-soon', badge: days < 0 ? '逾期' : '临近' },
        upcoming: { cls: 'status-upcoming', badge: '待办' }
    };
    const st = statusMap[s.status];

    const iconMap = {
        triad: '💉', 'triad-annual': '💉', rabies: '🐕', 'rabies-annual': '🐕',
        internal: '💊', external: '🧴', neuter: '✂️'
    };

    const icon = iconMap[s.type] || '📌';
    const noteHTML = (s.note || '').replace(/\n/g, '<br>');

    return `
        <div class="hm-next-item ${st.cls}">
            <span class="hm-icon">${icon}</span>
            <div class="hm-next-body">
                <div class="hm-next-row">
                    <span class="hm-next-label">${s.label}</span>
                    <span class="hm-badge ${st.cls}">${st.badge}</span>
                </div>
                <div class="hm-next-date">📅 ${s.due} <span class="hm-next-days">· ${daysLabel}</span></div>
                <div class="hm-next-note">${noteHTML}</div>
            </div>
        </div>
    `;
}

function currentGrowthStage(month) {
    for (const s of GROWTH_STAGES) {
        if (month <= s.maxMonth) return s;
    }
    return GROWTH_STAGES[GROWTH_STAGES.length - 1];
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

function updateBreedCard() {
    const breedName = GENDER === 'male' ? '英国短毛猫 · 金渐层 · ♂ 公猫' : '英国短毛猫 · 金渐层 · ♀ 母猫';
    document.getElementById('breed-name').textContent = breedName;
    document.getElementById('breed-stage').textContent = currentGrowthStage(calcMonthFromBirth(new Date())).name;
}

function updateHealthCard() {
    const last = records[records.length - 1];
    if (!last) return;

    const lastDate = new Date(last.date);
    const month = calcMonthFromBirth(lastDate);
    const std = lookupStd(month);
    const eval = evalWeight(last.weight, std);

    const stage = currentGrowthStage(month);

    document.getElementById('health-month').textContent = month.toFixed(1) + ' 月龄';
    document.getElementById('health-range').textContent = std.min.toFixed(2) + ' ~ ' + std.max.toFixed(2) + ' kg';
    document.getElementById('health-avg').textContent = std.avg.toFixed(2) + ' kg';
    document.getElementById('health-actual').textContent = last.weight.toFixed(2) + ' kg';
    document.getElementById('health-eval').textContent = eval.label;
    document.getElementById('health-eval').style.color = eval.color;
    document.getElementById('health-eval').style.background = eval.color + '18';

    if (eval.status === 'under') {
        document.getElementById('health-detail').textContent =
            '比该月龄标准下限低 ' + Math.abs(eval.diff).toFixed(2) + ' kg（低 ' + eval.pct.toFixed(0) + '%），建议增加营养摄入';
    } else if (eval.status === 'over') {
        document.getElementById('health-detail').textContent =
            '比该月龄标准上限高 ' + eval.diff.toFixed(2) + ' kg（高 ' + eval.pct.toFixed(0) + '%），建议控制饮食并增加运动';
    } else {
        document.getElementById('health-detail').textContent =
            '体重处于品种标准区间内，发育良好，继续保持！';
    }

    document.getElementById('health-stage-name').textContent = stage.name;
    document.getElementById('health-stage-note').textContent = stage.note;
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

        const month = calcMonthFromBirth(new Date(r.date));
        const std = lookupStd(month);
        const ev = evalWeight(r.weight, std);

        const stdMin = std.min;
        const stdMax = std.max;
        const range = stdMax - stdMin;
        const pad = range * 0.4;
        const viewMin = Math.max(0, stdMin - pad);
        const viewMax = stdMax + pad;
        const viewRange = viewMax - viewMin;
        const markerPos = Math.max(0, Math.min(100, ((r.weight - viewMin) / viewRange) * 100));

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="td-date">${r.date}</td>
            <td class="td-weight">${r.weight.toFixed(2)} <small>kg</small></td>
            <td class="${growClass} td-grow">${growStr}</td>
            <td class="bar-cell">
                <div class="bar-wrap">
                    <div class="bar-fill" style="width: ${pct}%"></div>
                </div>
            </td>
            <td class="td-std">
                <div class="std-range">
                    <div class="std-range-track"></div>
                    <div class="std-range-band" style="left: ${((stdMin - viewMin) / viewRange) * 100}%; width: ${(range / viewRange) * 100}%"></div>
                    <div class="std-range-marker ${ev.status}" style="left: ${markerPos}%; background: ${ev.color}"></div>
                </div>
                <div class="std-range-labels">
                    <span>${stdMin.toFixed(1)}</span>
                    <span class="std-range-center">${((stdMin + stdMax) / 2).toFixed(1)}</span>
                    <span>${stdMax.toFixed(1)}</span>
                </div>
                <span class="std-badge" style="border-color: ${ev.color}50; background: ${ev.color}14; color: ${ev.color}">${ev.label}</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

let chart = null;
function updateChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');

    const allMonths = records.map(r => calcMonthFromBirth(new Date(r.date)));
    const labels = records.map(r => r.date.slice(5));
    const dataActual = records.map(r => r.weight);

    const allStd = BRITISH_STD[GENDER];
    const monthLabels = allStd.map(s => s.month + '月');
    const stdMin = allStd.map(s => s.min);
    const stdMax = allStd.map(s => s.max);
    const stdAvg = allStd.map(s => s.avg);

    if (chart) chart.destroy();

    const actualGrad = ctx.createLinearGradient(0, 0, 0, 320);
    actualGrad.addColorStop(0, 'rgba(255, 140, 66, 0.35)');
    actualGrad.addColorStop(1, 'rgba(255, 140, 66, 0.02)');

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '品种标准下限',
                    data: records.map(r => {
                        const m = calcMonthFromBirth(new Date(r.date));
                        return lookupStd(m).min;
                    }),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.06)',
                    borderDash: [6, 4],
                    borderWidth: 1.8,
                    fill: '+1',
                    tension: 0.4,
                    pointRadius: 0,
                    order: 3
                },
                {
                    label: '品种标准上限',
                    data: records.map(r => {
                        const m = calcMonthFromBirth(new Date(r.date));
                        return lookupStd(m).max;
                    }),
                    borderColor: '#ec4899',
                    backgroundColor: 'transparent',
                    borderDash: [6, 4],
                    borderWidth: 1.8,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    order: 3
                },
                {
                    label: '标准均值',
                    data: records.map(r => {
                        const m = calcMonthFromBirth(new Date(r.date));
                        return lookupStd(m).avg;
                    }),
                    borderColor: '#7c3aed',
                    backgroundColor: 'transparent',
                    borderDash: [2, 3],
                    borderWidth: 1.5,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    order: 2
                },
                {
                    label: '波比实际体重',
                    data: dataActual,
                    borderColor: '#ff8c42',
                    backgroundColor: actualGrad,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#ff8c42',
                    pointBorderWidth: 2.5,
                    pointRadius: 7,
                    pointHoverRadius: 10,
                    pointHoverBackgroundColor: '#ff8c42',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: ['line', 'line', 'line', 'circle'],
                        padding: 14,
                        font: { family: 'Noto Sans SC', size: 11 },
                        color: '#8b7355',
                        boxWidth: 12,
                        boxHeight: 2
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(61, 44, 30, 0.92)',
                    titleFont: { family: 'Noto Sans SC', size: 12 },
                    bodyFont: { family: 'Noto Sans SC', size: 12, weight: 'bold' },
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: true,
                    callbacks: {
                        label: (ctx) => {
                            if (ctx.datasetIndex === 3) {
                                const m = calcMonthFromBirth(new Date(records[ctx.dataIndex].date));
                                const std = lookupStd(m);
                                const ev = evalWeight(ctx.parsed.y, std);
                                return `⚖️  ${ctx.parsed.y.toFixed(2)} kg  (${ev.label})`;
                            }
                            return `  ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} kg`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#b5a08a', font: { family: 'Noto Sans SC', size: 11 } },
                    border: { display: false }
                },
                y: {
                    grid: { color: '#fff0e0', drawBorder: false },
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
    updateBreedCard();
    updateHealthCard();
    updateHealthManageCard();
    updateTable();
    updateChart();
    pickQuote();
}

window.addEventListener('DOMContentLoaded', render);
