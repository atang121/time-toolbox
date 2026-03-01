/**
 * 日期加减计算功能
 */

function initDatePicker(prefix, startYear, endYear) {
    const yearSelect = document.getElementById(prefix + 'Year');
    const monthSelect = document.getElementById(prefix + 'Month');
    const daySelect = document.getElementById(prefix + 'Day');

    // 填充年份
    for (let y = endYear; y >= startYear; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y + '年';
        yearSelect.appendChild(opt);
    }

    // 填充月份
    for (let m = 1; m <= 12; m++) {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m + '月';
        monthSelect.appendChild(opt);
    }

    // 填充日期
    updateDays(prefix);

    // 监听年月变化更新日期
    yearSelect.addEventListener('change', () => updateDays(prefix));
    monthSelect.addEventListener('change', () => updateDays(prefix));
}

function updateDays(prefix) {
    const yearSelect = document.getElementById(prefix + 'Year');
    const monthSelect = document.getElementById(prefix + 'Month');
    const daySelect = document.getElementById(prefix + 'Day');

    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    const currentDay = parseInt(daySelect.value) || 1;

    const daysInMonth = new Date(year, month, 0).getDate();

    daySelect.innerHTML = '';
    for (let d = 1; d <= daysInMonth; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d + '日';
        daySelect.appendChild(opt);
    }

    daySelect.value = Math.min(currentDay, daysInMonth);
}

function setTodayBase() {
    const today = new Date();
    document.getElementById('baseYear').value = today.getFullYear();
    document.getElementById('baseMonth').value = today.getMonth() + 1;
    updateDays('base');
    document.getElementById('baseDay').value = today.getDate();
}

function setDirection(value) {
    document.getElementById('direction').value = value;
    
    document.querySelectorAll('.direction-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.value === value) {
            btn.classList.add('active');
        }
    });
}

function getSelectedDate(prefix) {
    const year = parseInt(document.getElementById(prefix + 'Year').value);
    const month = parseInt(document.getElementById(prefix + 'Month').value) - 1;
    const day = parseInt(document.getElementById(prefix + 'Day').value);
    return new Date(year, month, day);
}

function calculateDate() {
    const baseDate = getSelectedDate('base');
    const direction = document.getElementById('direction').value;
    const amount = parseInt(document.getElementById('amount').value) || 0;
    const unit = document.getElementById('unit').value;

    if (isNaN(baseDate.getTime())) {
        showResult('请选择有效的日期', true);
        return;
    }

    let resultDate = new Date(baseDate);
    const multiplier = direction === 'add' ? 1 : -1;

    switch (unit) {
        case 'days':
            resultDate.setDate(resultDate.getDate() + (amount * multiplier));
            break;
        case 'weeks':
            resultDate.setDate(resultDate.getDate() + (amount * 7 * multiplier));
            break;
        case 'months':
            resultDate.setMonth(resultDate.getMonth() + (amount * multiplier));
            break;
    }

    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[resultDate.getDay()];
    
    const baseStr = formatDateChinese(baseDate);
    const resultStr = formatDateChinese(resultDate);
    const directionText = direction === 'add' ? '往后' : '往前';
    const unitText = { days: '天', weeks: '周', months: '个月' }[unit];

    let html = `
        <div style="text-align: center;">
            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 0.5rem;">
                ${baseStr} ${directionText} ${amount} ${unitText}
            </div>
            <div style="font-size: 1.8rem; color: #d4af37; font-weight: bold; margin: 1rem 0;">
                ${resultStr}
            </div>
            <div style="color: #00ffcc; font-size: 1rem;">
                ${weekday}
            </div>
        </div>
    `;

    showResult(html, false);
}

function formatDateChinese(date) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function showResult(content, isError) {
    const resultDiv = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');
    
    resultDiv.style.display = 'block';
    resultContent.innerHTML = content;
    
    if (isError) {
        resultDiv.style.borderColor = '#ff6b6b';
    } else {
        resultDiv.style.borderColor = 'rgba(255,255,255,0.1)';
    }

    gsap.from(resultDiv, { opacity: 0, y: 20, duration: 0.5 });
}
