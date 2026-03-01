/**
 * 相隔天数计算功能
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

function setToday(prefix) {
    const today = new Date();
    document.getElementById(prefix + 'Year').value = today.getFullYear();
    document.getElementById(prefix + 'Month').value = today.getMonth() + 1;
    updateDays(prefix);
    document.getElementById(prefix + 'Day').value = today.getDate();
}

function getSelectedDate(prefix) {
    const year = parseInt(document.getElementById(prefix + 'Year').value);
    const month = parseInt(document.getElementById(prefix + 'Month').value) - 1;
    const day = parseInt(document.getElementById(prefix + 'Day').value);
    return new Date(year, month, day);
}

function calculateDaysDiff() {
    const startDate = getSelectedDate('start');
    const endDate = getSelectedDate('end');

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        showResult('请选择有效的日期', true);
        return;
    }

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    const months = (diffDays / 30.44).toFixed(1);

    const startStr = formatDateChinese(startDate);
    const endStr = formatDateChinese(endDate);

    let html = `
        <div style="text-align: center;">
            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 0.5rem;">
                ${startStr} 至 ${endStr}
            </div>
            <div style="font-size: 2.5rem; color: #d4af37; font-weight: bold; margin: 1rem 0;">
                ${diffDays} <span style="font-size: 1rem;">天</span>
            </div>
            <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1rem; font-size: 0.9rem;">
                <div>
                    <span style="color: rgba(255,255,255,0.5);">约</span>
                    <span style="color: #3a86ff; font-weight: bold;">${weeks}</span>
                    <span style="color: rgba(255,255,255,0.5);">周</span>
                    <span style="color: #3a86ff; font-weight: bold;">${remainingDays}</span>
                    <span style="color: rgba(255,255,255,0.5);">天</span>
                </div>
                <div>
                    <span style="color: rgba(255,255,255,0.5);">约</span>
                    <span style="color: #00ffcc; font-weight: bold;">${months}</span>
                    <span style="color: rgba(255,255,255,0.5);">个月</span>
                </div>
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
