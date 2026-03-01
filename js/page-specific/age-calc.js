/**
 * 年龄计算功能（支持阳历和农历）
 */

let currentCalendarType = 'solar';
const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

function initDatePicker(prefix, startYear, endYear) {
    const yearSelect = document.getElementById(prefix + 'Year');
    const monthSelect = document.getElementById(prefix + 'Month');
    const daySelect = document.getElementById(prefix + 'Day');

    if (!yearSelect || !monthSelect || !daySelect) {
        console.error('日期选择器元素未找到:', prefix);
        return;
    }

    for (let y = endYear; y >= startYear; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y + '年';
        yearSelect.appendChild(opt);
    }

    updateMonths(prefix);

    yearSelect.addEventListener('change', () => {
        if (prefix === 'birth') updateMonths(prefix);
        updateDays(prefix);
    });
    monthSelect.addEventListener('change', () => updateDays(prefix));
    
    console.log('日期选择器初始化完成:', prefix);
}

function updateMonths(prefix) {
    const monthSelect = document.getElementById(prefix + 'Month');
    const currentMonth = parseInt(monthSelect.value) || 1;
    monthSelect.innerHTML = '';

    if (prefix === 'birth' && currentCalendarType === 'lunar') {
        for (let m = 1; m <= 12; m++) {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = lunarMonths[m - 1];
            monthSelect.appendChild(opt);
        }
    } else {
        for (let m = 1; m <= 12; m++) {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m + '月';
            monthSelect.appendChild(opt);
        }
    }

    monthSelect.value = Math.min(currentMonth, 12);
    updateDays(prefix);
}

function updateDays(prefix) {
    const yearSelect = document.getElementById(prefix + 'Year');
    const monthSelect = document.getElementById(prefix + 'Month');
    const daySelect = document.getElementById(prefix + 'Day');

    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    const currentDay = parseInt(daySelect.value) || 1;

    let daysInMonth;
    if (prefix === 'birth' && currentCalendarType === 'lunar') {
        daysInMonth = 30;
    } else {
        daysInMonth = new Date(year, month, 0).getDate();
    }

    daySelect.innerHTML = '';
    for (let d = 1; d <= daysInMonth; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        if (prefix === 'birth' && currentCalendarType === 'lunar') {
            opt.textContent = lunarDays[d - 1];
        } else {
            opt.textContent = d + '日';
        }
        daySelect.appendChild(opt);
    }

    daySelect.value = Math.min(currentDay, daysInMonth);
}

function setCalendarType(type) {
    currentCalendarType = type;
    
    document.querySelectorAll('.calendar-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });

    const birthLabel = document.getElementById('birthLabel');
    const leapMonthOption = document.getElementById('leapMonthOption');
    
    if (type === 'solar') {
        birthLabel.textContent = '出生日期（阳历）';
        leapMonthOption.style.display = 'none';
    } else {
        birthLabel.textContent = '出生日期（农历）';
        leapMonthOption.style.display = 'block';
    }

    updateMonths('birth');
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
    let birthDate;
    let lunarBirthInfo = null;
    
    const birthYear = parseInt(document.getElementById('birthYear').value);
    const birthMonth = parseInt(document.getElementById('birthMonth').value);
    const birthDay = parseInt(document.getElementById('birthDay').value);
    
    if (currentCalendarType === 'lunar') {
        if (typeof Lunar === 'undefined') {
            showResult('农历库加载失败，请刷新页面重试', true);
            return;
        }
        
        try {
            const isLeapMonth = document.getElementById('isLeapMonth').checked;
            const lunar = Lunar.fromYmd(birthYear, isLeapMonth ? -birthMonth : birthMonth, birthDay);
            const solar = lunar.getSolar();
            birthDate = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
            
            lunarBirthInfo = {
                year: birthYear,
                month: birthMonth,
                day: birthDay,
                isLeap: isLeapMonth,
                monthStr: (isLeapMonth ? '闰' : '') + lunarMonths[birthMonth - 1],
                dayStr: lunarDays[birthDay - 1],
                ganZhi: lunar.getYearInGanZhi()
            };
        } catch (error) {
            showResult('农历日期无效，请检查输入', true);
            return;
        }
    } else {
        birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    }
    
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

    const totalDays = Math.floor((targetDate - birthDate) / (1000 * 60 * 60 * 24));

    let nextBirthday = new Date(targetDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday <= targetDate) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysToNextBirthday = Math.ceil((nextBirthday - targetDate) / (1000 * 60 * 60 * 24));

    // 生肖必须根据农历年份判断
    let zodiac = '';
    if (typeof Lunar !== 'undefined') {
        try {
            // 将阳历生日转换为农历，获取正确的生肖
            const lunarForZodiac = Lunar.fromDate(birthDate);
            zodiac = lunarForZodiac.getYearShengXiao();
        } catch (e) {
            // 降级：使用简单计算（不够准确）
            const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
            zodiac = zodiacAnimals[(birthDate.getFullYear() - 4) % 12];
        }
    } else {
        const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
        zodiac = zodiacAnimals[(birthDate.getFullYear() - 4) % 12];
    }

    const constellation = getConstellation(birthDate.getMonth() + 1, birthDate.getDate());

    let birthDateDisplay;
    if (currentCalendarType === 'lunar') {
        birthDateDisplay = `
            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-bottom: 1rem;">
                农历 ${lunarBirthInfo.ganZhi}年 ${lunarBirthInfo.monthStr}${lunarBirthInfo.dayStr}<br>
                <span style="color: rgba(255,255,255,0.4);">（阳历 ${birthDate.getFullYear()}年${birthDate.getMonth()+1}月${birthDate.getDate()}日）</span>
            </div>
        `;
    } else {
        birthDateDisplay = '';
    }

    let html = `
        <div style="text-align: center;">
            ${birthDateDisplay}
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

    if (typeof gsap !== 'undefined') {
        gsap.from(resultDiv, { opacity: 0, y: 20, duration: 0.5 });
    }
}
