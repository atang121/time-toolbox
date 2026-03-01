/**
 * 二维码生成功能
 */

let qrCodeInstance = null;

function setExampleContent(content) {
    document.getElementById('qrcodeInput').value = content;
}

function validateUrl(url) {
    if (!url || url.trim() === '') {
        return { valid: false, message: '请输入网址' };
    }
    
    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
    }
    
    try {
        new URL(processedUrl);
        return { valid: true, url: processedUrl };
    } catch (e) {
        return { valid: false, message: '请输入有效的网址' };
    }
}

function generateQRCode() {
    const input = document.getElementById('qrcodeInput').value;
    const validation = validateUrl(input);
    
    if (!validation.valid) {
        showQRCodeError(validation.message);
        return;
    }
    
    const resultDiv = document.getElementById('qrcodeResult');
    const container = document.getElementById('qrcodeContainer');
    
    container.innerHTML = '';
    resultDiv.style.display = 'block';
    
    gsap.from(resultDiv, { opacity: 0, y: 20, duration: 0.3 });
    
    try {
        qrCodeInstance = new QRCode(container, {
            text: validation.url,
            width: 180,
            height: 180,
            colorDark: '#1a1a2e',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        container.innerHTML = `<span style="color: #ff6b6b; display: block; padding: 2rem;">二维码生成失败</span>`;
    }
}

function showQRCodeError(message) {
    const resultDiv = document.getElementById('qrcodeResult');
    const container = document.getElementById('qrcodeContainer');
    
    resultDiv.style.display = 'block';
    container.innerHTML = `<span style="color: #ff6b6b; display: block; padding: 2rem;">${message}</span>`;
    
    gsap.from(resultDiv, { opacity: 0, y: 20, duration: 0.3 });
}

function downloadQRCode() {
    const container = document.getElementById('qrcodeContainer');
    const canvas = container.querySelector('canvas');
    const img = container.querySelector('img');
    
    let dataUrl;
    if (canvas) {
        dataUrl = canvas.toDataURL('image/png');
    } else if (img) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        dataUrl = tempCanvas.toDataURL('image/png');
    } else {
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = dataUrl;
    link.click();
    
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> 已下载';
    btn.style.background = 'rgba(0, 255, 100, 0.2)';
    btn.style.borderColor = 'rgba(0, 255, 100, 0.3)';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = 'rgba(255,255,255,0.1)';
        btn.style.borderColor = 'rgba(255,255,255,0.2)';
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    const qrcodeInput = document.getElementById('qrcodeInput');
    if (qrcodeInput) {
        qrcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                generateQRCode();
            }
        });
    }
});
