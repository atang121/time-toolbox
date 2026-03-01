/**
 * 人民币大写转换功能
 */

const digitUppercase = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const unitUppercase = ['', '拾', '佰', '仟'];
const sectionUnit = ['', '万', '亿', '兆'];

function formatInput(input) {
    let value = input.value.replace(/[^\d.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].slice(0, 2);
    }
    // 添加千分位
    if (parts[0]) {
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    input.value = parts.join('.');
}

function setQuickAmount(amount) {
    document.getElementById('amountInput').value = amount.toLocaleString();
    convertToUpperCase();
}

function convertToUpperCase() {
    let inputValue = document.getElementById('amountInput').value;
    inputValue = inputValue.replace(/,/g, '');
    
    const amount = parseFloat(inputValue);
    
    if (isNaN(amount) || amount < 0) {
        showResult('请输入有效的金额', true);
        return;
    }
    
    if (amount > 999999999999.99) {
        showResult('金额超出范围（最大支持千亿）', true);
        return;
    }

    const upperCase = convertNumberToUppercase(amount);
    
    let html = `
        <div style="text-align: center;">
            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 0.5rem;">
                ¥ ${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style="font-size: 1.5rem; color: #d4af37; font-weight: bold; margin: 1rem 0; font-family: 'Noto Serif SC', serif; letter-spacing: 2px;">
                ${upperCase}
            </div>
            <button onclick="copyResult('${upperCase}')" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 0.85rem;">
                <i class="fas fa-copy"></i> 复制
            </button>
        </div>
    `;

    showResult(html, false);
}

function convertNumberToUppercase(num) {
    if (num === 0) {
        return '零元整';
    }

    const numStr = num.toFixed(2);
    const parts = numStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    let result = '';

    // 处理整数部分
    if (parseInt(integerPart) > 0) {
        result += convertIntegerPart(integerPart) + '元';
    }

    // 处理小数部分
    const jiao = parseInt(decimalPart[0]);
    const fen = parseInt(decimalPart[1]);

    if (jiao === 0 && fen === 0) {
        result += '整';
    } else {
        if (parseInt(integerPart) > 0 && jiao === 0) {
            result += '零';
        }
        if (jiao > 0) {
            result += digitUppercase[jiao] + '角';
        }
        if (fen > 0) {
            result += digitUppercase[fen] + '分';
        }
    }

    return result;
}

function convertIntegerPart(intStr) {
    const len = intStr.length;
    let result = '';
    let zeroCount = 0;

    for (let i = 0; i < len; i++) {
        const digit = parseInt(intStr[i]);
        const pos = len - i - 1;
        const sectionPos = Math.floor(pos / 4);
        const unitPos = pos % 4;

        if (digit === 0) {
            zeroCount++;
        } else {
            if (zeroCount > 0) {
                result += '零';
            }
            zeroCount = 0;
            result += digitUppercase[digit] + unitUppercase[unitPos];
        }

        // 添加节权位（万、亿）
        if (unitPos === 0 && sectionPos > 0) {
            // 检查这一节是否全为零
            const sectionStart = Math.max(0, i - 3);
            let sectionAllZero = true;
            for (let j = sectionStart; j <= i; j++) {
                if (parseInt(intStr[j]) !== 0) {
                    sectionAllZero = false;
                    break;
                }
            }
            if (!sectionAllZero) {
                result += sectionUnit[sectionPos];
                zeroCount = 0;
            }
        }
    }

    return result;
}

function copyResult(text) {
    navigator.clipboard.writeText(text).then(() => {
        // 显示复制成功提示
        const btn = event.target.closest('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        btn.style.background = 'rgba(0, 255, 100, 0.2)';
        btn.style.borderColor = 'rgba(0, 255, 100, 0.3)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.borderColor = 'rgba(255,255,255,0.2)';
        }, 2000);
    });
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
