/**
 * 农历阳历转换功能
 */

let currentDirection = 'solar2lunar';
const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

document.addEventListener('DOMContentLoaded', () => {
    console.log('农历转换页面初始化...');
    try {
        initDatePicker();
        setToday();
        console.log('农历转换页面初始化完成');
    } catch (e) {
        console.error('初始化失败:', e);
    }
});

function initDatePicker() {
    const yearSelect = document.getElementById('inputYear');
    const monthSelect = document.getElementById('inputMonth');
    const daySelect = document.getElementById('inputDay');

    if (!yearSelect || !monthSelect || !daySelect) {
        console.error('日期选择器元素未找到');
        return;
    }

    for (let y = 2100; y >= 1900; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y + '年';
        yearSelect.appendChild(opt);
    }

    updateMonths();

    yearSelect.addEventListener('change', () => {
        updateMonths();
        updateDays();
    });
    monthSelect.addEventListener('change', updateDays);
}

function updateMonths() {
    const monthSelect = document.getElementById('inputMonth');
    const currentMonth = parseInt(monthSelect.value) || 1;
    monthSelect.innerHTML = '';

    if (currentDirection === 'solar2lunar') {
        for (let m = 1; m <= 12; m++) {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m + '月';
            monthSelect.appendChild(opt);
        }
    } else {
        for (let m = 1; m <= 12; m++) {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = lunarMonths[m - 1];
            monthSelect.appendChild(opt);
        }
    }

    monthSelect.value = Math.min(currentMonth, 12);
    updateDays();
}

function updateDays() {
    const yearSelect = document.getElementById('inputYear');
    const monthSelect = document.getElementById('inputMonth');
    const daySelect = document.getElementById('inputDay');

    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    const currentDay = parseInt(daySelect.value) || 1;

    let daysInMonth;
    if (currentDirection === 'solar2lunar') {
        daysInMonth = new Date(year, month, 0).getDate();
    } else {
        daysInMonth = 30;
    }

    daySelect.innerHTML = '';
    for (let d = 1; d <= daysInMonth; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        if (currentDirection === 'solar2lunar') {
            opt.textContent = d + '日';
        } else {
            opt.textContent = lunarDays[d - 1];
        }
        daySelect.appendChild(opt);
    }

    daySelect.value = Math.min(currentDay, daysInMonth);
}

function setDirection(direction) {
    currentDirection = direction;
    
    document.querySelectorAll('.direction-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.direction === direction) {
            btn.classList.add('active');
        }
    });

    const inputLabel = document.getElementById('inputLabel');
    const leapMonthOption = document.getElementById('leapMonthOption');
    
    if (direction === 'solar2lunar') {
        inputLabel.textContent = '阳历日期';
        leapMonthOption.style.display = 'none';
    } else {
        inputLabel.textContent = '农历日期';
        leapMonthOption.style.display = 'block';
    }

    updateMonths();
}

function setToday() {
    if (currentDirection !== 'solar2lunar') {
        setDirection('solar2lunar');
    }
    
    const today = new Date();
    document.getElementById('inputYear').value = today.getFullYear();
    updateMonths();
    document.getElementById('inputMonth').value = today.getMonth() + 1;
    updateDays();
    document.getElementById('inputDay').value = today.getDate();
}

function setSpringFestival() {
    setDirection('lunar2solar');
    const year = new Date().getFullYear();
    document.getElementById('inputYear').value = year;
    updateMonths();
    document.getElementById('inputMonth').value = 1;
    updateDays();
    document.getElementById('inputDay').value = 1;
    document.getElementById('isLeapMonth').checked = false;
}

function setMidAutumn() {
    setDirection('lunar2solar');
    const year = new Date().getFullYear();
    document.getElementById('inputYear').value = year;
    updateMonths();
    document.getElementById('inputMonth').value = 8;
    updateDays();
    document.getElementById('inputDay').value = 15;
    document.getElementById('isLeapMonth').checked = false;
}

function setDragonBoat() {
    setDirection('lunar2solar');
    const year = new Date().getFullYear();
    document.getElementById('inputYear').value = year;
    updateMonths();
    document.getElementById('inputMonth').value = 5;
    updateDays();
    document.getElementById('inputDay').value = 5;
    document.getElementById('isLeapMonth').checked = false;
}

function convertDate() {
    const year = parseInt(document.getElementById('inputYear').value);
    const month = parseInt(document.getElementById('inputMonth').value);
    const day = parseInt(document.getElementById('inputDay').value);

    if (typeof Lunar === 'undefined') {
        showResult('农历库加载失败，请刷新页面重试', true);
        return;
    }

    try {
        let html;
        if (currentDirection === 'solar2lunar') {
            const solar = Solar.fromYmd(year, month, day);
            const lunar = solar.getLunar();
            
            const lunarYearGanZhi = lunar.getYearInGanZhi();
            const lunarMonthStr = (lunar.getMonth() < 0 ? '闰' : '') + lunarMonths[Math.abs(lunar.getMonth()) - 1];
            const lunarDayStr = lunarDays[lunar.getDay() - 1];
            
            const zodiac = lunar.getYearShengXiao();
            const jieQi = lunar.getJieQi() || '无';
            
            html = `
                <div style="text-align: center;">
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 0.5rem;">
                        阳历 ${year}年${month}月${day}日 对应农历
                    </div>
                    <div style="font-size: 1.8rem; color: #d4af37; font-weight: bold; margin: 1rem 0;">
                        ${lunarMonthStr}${lunarDayStr}
                    </div>
                    <div style="font-size: 1rem; color: rgba(255,255,255,0.8); margin-bottom: 1rem;">
                        ${lunarYearGanZhi}年（${zodiac}年）
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-top: 1rem; text-align: left;">
                        <div style="background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 8px;">
                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">农历年份</div>
                            <div style="font-size: 1rem; color: #fff;">${lunar.getYear()}年</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 8px;">
                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">节气</div>
                            <div style="font-size: 1rem; color: #fff;">${jieQi}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 8px;">
                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">生肖</div>
                            <div style="font-size: 1rem; color: #fff;">属${zodiac}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 8px;">
                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">星期</div>
                            <div style="font-size: 1rem; color: #fff;">${solar.getWeekInChinese()}</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            const isLeapMonth = document.getElementById('isLeapMonth').checked;
            const lunar = Lunar.fromYmd(year, isLeapMonth ? -month : month, day);
            const solar = lunar.getSolar();
            
            const lunarYearGanZhi = lunar.getYearInGanZhi();
            const lunarMonthStr = (isLeapMonth ? '闰' : '') + lunarMonths[month - 1];
            const lunarDayStr = lunarDays[day - 1];
            const zodiac = lunar.getYearShengXiao();
            
            html = `
                <div style="text-align: center;">
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 0.5rem;">
                        农历 ${lunarYearGanZhi}年 ${lunarMonthStr}${lunarDayStr} 对应阳历
                    </div>
                    <div style="font-size: 1.8rem; color: #d4af37; font-weight: bold; margin: 1rem 0;">
                        ${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日
                    </div>
                    <div style="font-size: 1rem; color: rgba(255,255,255,0.8); margin-bottom: 1rem;">
                        ${solar.getWeekInChinese()}
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-top: 1rem; text-align: left;">
                        <div style="background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 8px;">
                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">农历年份</div>
                            <div style="font-size: 1rem; color: #fff;">${year}年</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 8px;">
                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">生肖</div>
                            <div style="font-size: 1rem; color: #fff;">属${zodiac}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        showResult(html, false);
    } catch (error) {
        console.error('转换失败:', error);
        showResult('日期转换失败，请检查输入是否有效', true);
    }
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
