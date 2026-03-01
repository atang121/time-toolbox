/**
 * 年龄计算功能
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

function setTodayTarget() {
    const today = new Date();
    document.getElementById('targetYear').value = today.getFullYear();
    document.getElementById('targetMonth').value = today.getMonth() + 1;
    updateDays('target');
    document.getElementById('targetDay').value = today.getDate();
}

function setDefaultBirthDate() {
    const today = new Date();
    // 默认设置为30年前的今天（一个合理的出生日期默认值）
    const defaultYear = today.getFullYear() - 30;
    document.getElementById('birthYear').value = defaultYear;
    document.getElementById('birthMonth').value = 1;
    updateDays('birth');
    document.getElementById('birthDay').value = 1;
}

function getSelectedDate(prefix) {
    const year = parseInt(document.getElementById(prefix + 'Year').value);
    const month = parseInt(document.getElementById(prefix + 'Month').value) - 1;
    const day = parseInt(document.getElementById(prefix + 'Day').value);
    return new Date(year, month, day);
}

function calculateAge() {
    const birthDate = getSelectedDate('birth');
    let targetDate = getSelectedDate('target');

    if (isNaN(birthDate.getTime())) {
        showResult('请选择有效的出生日期', true);
        return;
    }

    if (isNaN(targetDate.getTime())) {
        targetDate = new Date();
    }

    if (birthDate > targetDate) {
        showResult('出生日期不能晚于目标日期', true);
        return;
    }

    // 计算精确年龄
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    // 计算总天数
    const totalDays = Math.floor((targetDate - birthDate) / (1000 * 60 * 60 * 24));

    // 计算下次生日
    let nextBirthday = new Date(targetDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday <= targetDate) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysToNextBirthday = Math.ceil((nextBirthday - targetDate) / (1000 * 60 * 60 * 24));

    // 生肖
    const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    const zodiac = zodiacAnimals[(birthDate.getFullYear() - 4) % 12];

    // 星座
    const constellation = getConstellation(birthDate.getMonth() + 1, birthDate.getDate());

    let html = `
        <div style="text-align: center;">
            <div style="font-size: 2.5rem; color: #d4af37; font-weight: bold; margin-bottom: 0.5rem;">
                ${years} <span style="font-size: 1rem;">岁</span>
                ${months > 0 ? `<span style="font-size: 1.5rem; color: #3a86ff;">${months}</span><span style="font-size: 0.9rem;">个月</span>` : ''}
                ${days > 0 ? `<span style="font-size: 1.2rem; color: #00ffcc;">${days}</span><span style="font-size: 0.8rem;">天</span>` : ''}
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; text-align: left;">
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">已度过</div>
                    <div style="font-size: 1.2rem; color: #fff;">${totalDays.toLocaleString()} 天</div>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">距下次生日</div>
                    <div style="font-size: 1.2rem; color: #fff;">${daysToNextBirthday} 天</div>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">生肖</div>
                    <div style="font-size: 1.2rem; color: #fff;">属${zodiac}</div>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">星座</div>
                    <div style="font-size: 1.2rem; color: #fff;">${constellation}</div>
                </div>
            </div>
        </div>
    `;

    showResult(html, false);
}

function getConstellation(month, day) {
    const constellations = [
        { name: '摩羯座', start: [1, 1], end: [1, 19] },
        { name: '水瓶座', start: [1, 20], end: [2, 18] },
        { name: '双鱼座', start: [2, 19], end: [3, 20] },
        { name: '白羊座', start: [3, 21], end: [4, 19] },
        { name: '金牛座', start: [4, 20], end: [5, 20] },
        { name: '双子座', start: [5, 21], end: [6, 21] },
        { name: '巨蟹座', start: [6, 22], end: [7, 22] },
        { name: '狮子座', start: [7, 23], end: [8, 22] },
        { name: '处女座', start: [8, 23], end: [9, 22] },
        { name: '天秤座', start: [9, 23], end: [10, 23] },
        { name: '天蝎座', start: [10, 24], end: [11, 22] },
        { name: '射手座', start: [11, 23], end: [12, 21] },
        { name: '摩羯座', start: [12, 22], end: [12, 31] }
    ];

    for (const c of constellations) {
        const [startMonth, startDay] = c.start;
        const [endMonth, endDay] = c.end;
        
        if (month === startMonth && day >= startDay) return c.name;
        if (month === endMonth && day <= endDay) return c.name;
    }
    return '未知';
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
