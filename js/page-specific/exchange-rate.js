/**
 * 实时汇率换算工具
 * 使用 fawazahmed0/exchange-api - 免费、无限制
 * API 文档: https://github.com/fawazahmed0/exchange-api
 */

// API 配置（主域名 + 备用域名）
const API_CONFIG = {
    primary: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1',
    fallback: 'https://latest.currency-api.pages.dev/v1'
};

// 货币配置
const CURRENCIES = {
    usd: { name: '美元', symbol: '$', flag: '🇺🇸' },
    cny: { name: '人民币', symbol: '¥', flag: '🇨🇳' },
    eur: { name: '欧元', symbol: '€', flag: '🇪🇺' },
    gbp: { name: '英镑', symbol: '£', flag: '🇬🇧' },
    jpy: { name: '日元', symbol: '¥', flag: '🇯🇵' },
    hkd: { name: '港币', symbol: 'HK$', flag: '🇭🇰' },
    krw: { name: '韩元', symbol: '₩', flag: '🇰🇷' },
    sgd: { name: '新加坡元', symbol: 'S$', flag: '🇸🇬' },
    aud: { name: '澳元', symbol: 'A$', flag: '🇦🇺' },
    cad: { name: '加元', symbol: 'C$', flag: '🇨🇦' },
    chf: { name: '瑞士法郎', symbol: 'CHF', flag: '🇨🇭' },
    thb: { name: '泰铢', symbol: '฿', flag: '🇹🇭' },
    myr: { name: '林吉特', symbol: 'RM', flag: '🇲🇾' },
    inr: { name: '印度卢比', symbol: '₹', flag: '🇮🇳' },
    rub: { name: '俄罗斯卢布', symbol: '₽', flag: '🇷🇺' }
};

// 全局状态
let exchangeRates = {};
let rateDate = '';
let isLoading = false;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadExchangeRates();
});

// 加载汇率数据
async function loadExchangeRates() {
    if (isLoading) return;
    isLoading = true;
    
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.classList.add('loading');
    }
    
    updateRateInfo('正在获取汇率...');
    
    try {
        // 尝试主域名
        let success = await fetchRates(API_CONFIG.primary);
        
        // 如果主域名失败，尝试备用域名
        if (!success) {
            console.log('主域名请求失败，尝试备用域名...');
            success = await fetchRates(API_CONFIG.fallback);
        }
        
        if (success) {
            convertCurrency();
        } else {
            updateRateInfo('汇率获取失败，请稍后重试');
        }
    } catch (error) {
        console.error('加载汇率失败:', error);
        updateRateInfo('汇率获取失败，请稍后重试');
    } finally {
        isLoading = false;
        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
        }
    }
}

// 从 API 获取汇率
async function fetchRates(baseUrl) {
    try {
        // 获取 USD 为基准的汇率（可以计算任意货币对）
        const response = await fetch(`${baseUrl}/currencies/usd.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.usd) {
            exchangeRates = data.usd;
            rateDate = data.date || new Date().toISOString().split('T')[0];
            updateRateInfo(`汇率更新: ${formatDate(rateDate)}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('API 请求失败:', baseUrl, error);
        return false;
    }
}

// 刷新汇率
function refreshRates() {
    loadExchangeRates();
}

// 货币换算
function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    
    if (Object.keys(exchangeRates).length === 0) {
        document.getElementById('resultAmount').textContent = '--';
        document.getElementById('rateDetail').textContent = '汇率加载中...';
        return;
    }
    
    // 计算汇率（通过 USD 作为中介）
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    
    // 汇率计算: amount / fromRate * toRate
    const rate = toRate / fromRate;
    const result = amount * rate;
    
    // 格式化结果
    const formattedResult = formatNumber(result, toCurrency);
    document.getElementById('resultAmount').textContent = formattedResult;
    document.getElementById('resultCurrency').textContent = toCurrency.toUpperCase();
    
    // 显示汇率详情
    const rateFormatted = formatRate(rate);
    const fromInfo = CURRENCIES[fromCurrency] || { name: fromCurrency.toUpperCase() };
    const toInfo = CURRENCIES[toCurrency] || { name: toCurrency.toUpperCase() };
    document.getElementById('rateDetail').textContent = 
        `1 ${fromCurrency.toUpperCase()} = ${rateFormatted} ${toCurrency.toUpperCase()}`;
}

// 交换货币
function swapCurrencies() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    
    convertCurrency();
}

// 设置金额
function setAmount(value) {
    document.getElementById('amount').value = value;
    convertCurrency();
}

// 复制结果
function copyResult() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value.toUpperCase();
    const result = document.getElementById('resultAmount').textContent;
    const toCurrency = document.getElementById('resultCurrency').textContent;
    
    const text = `${amount} ${fromCurrency} = ${result} ${toCurrency}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板');
    }).catch(() => {
        // 备用方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('已复制到剪贴板');
    });
}

// 更新汇率信息显示
function updateRateInfo(text) {
    const rateDate = document.getElementById('rateDate');
    if (rateDate) {
        rateDate.textContent = text;
    }
}

// 格式化日期
function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return dateStr;
    }
}

// 格式化数字（根据货币类型决定小数位数）
function formatNumber(num, currency) {
    // 日元和韩元通常不显示小数
    const noDecimalCurrencies = ['jpy', 'krw'];
    
    if (noDecimalCurrencies.includes(currency)) {
        return Math.round(num).toLocaleString('zh-CN');
    }
    
    // 其他货币保留2-4位小数
    if (num >= 1000) {
        return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (num >= 1) {
        return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } else {
        return num.toLocaleString('zh-CN', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
    }
}

// 格式化汇率显示
function formatRate(rate) {
    if (rate >= 100) {
        return rate.toFixed(2);
    } else if (rate >= 1) {
        return rate.toFixed(4);
    } else {
        return rate.toFixed(6);
    }
}

// 显示提示
function showToast(message) {
    const existing = document.querySelector('.toast-message');
    if (existing) {
        existing.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(212, 175, 55, 0.9);
        color: #1a1a2e;
        padding: 0.8rem 1.5rem;
        border-radius: 25px;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 10000;
        animation: toastIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 添加 toast 动画样式
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes toastIn {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toastOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
`;
document.head.appendChild(toastStyle);
