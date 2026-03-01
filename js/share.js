/**
 * 分享功能
 */

function shareCurrentTool() {
    const pageTitle = document.title || '时光工具箱';
    const toolName = pageTitle.split(' - ')[0] || '实用工具';
    shareWebsite(
        pageTitle,
        `推荐一个好用的工具：${toolName}，免费使用！`,
        window.location.href
    );
}

function shareWebsite(title, text, url) {
    title = title || '时光工具箱 - 实用小工具集';
    text = text || '日期计算、农历转换、金额转换、短链接、二维码等实用工具，免费使用！';
    url = url || window.location.href;

    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).catch(err => {
            if (err.name !== 'AbortError') {
                showShareFallback(url);
            }
        });
    } else {
        showShareFallback(url);
    }
}

function showShareFallback(url) {
    const modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.innerHTML = `
        <div class="share-modal-overlay" onclick="closeShareModal()"></div>
        <div class="share-modal-content">
            <div class="share-modal-header">
                <span>分享给朋友</span>
                <button onclick="closeShareModal()" class="share-close-btn">&times;</button>
            </div>
            <div class="share-modal-body">
                <div class="share-link-box">
                    <input type="text" id="shareUrlInput" value="${url}" readonly>
                    <button onclick="copyShareLink()" class="share-copy-btn">
                        <i class="fas fa-copy"></i> 复制
                    </button>
                </div>
                <div class="share-qrcode-section">
                    <div class="share-qrcode-label">手机扫码访问</div>
                    <div id="shareQrcode" class="share-qrcode"></div>
                    <div class="share-qrcode-title">时光工具箱 - 实用小工具集</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('active'), 10);
    
    generateShareQrcode(url);
}

function generateShareQrcode(url) {
    const container = document.getElementById('shareQrcode');
    if (!container) return;
    
    if (typeof QRCode !== 'undefined') {
        new QRCode(container, {
            text: url,
            width: 120,
            height: 120,
            colorDark: '#1a1a2e',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });
    } else {
        const encodedUrl = encodeURIComponent(url);
        const img = document.createElement('img');
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodedUrl}`;
        img.alt = '二维码';
        img.style.cssText = 'width: 120px; height: 120px;';
        container.appendChild(img);
    }
}

function copyShareLink() {
    const input = document.getElementById('shareUrlInput');
    input.select();
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(input.value).then(() => {
            showCopySuccess();
        }).catch(() => {
            fallbackCopy(input);
        });
    } else {
        fallbackCopy(input);
    }
}

function fallbackCopy(input) {
    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (e) {
        alert('复制失败，请手动复制');
    }
}

function showCopySuccess() {
    const btn = document.querySelector('.share-copy-btn');
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        btn.style.background = 'rgba(76, 175, 80, 0.3)';
        btn.style.borderColor = 'rgba(76, 175, 80, 0.5)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
        }, 2000);
    }
}

function closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

const shareStyles = document.createElement('style');
shareStyles.textContent = `
    #shareModal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s;
    }
    #shareModal.active {
        opacity: 1;
        visibility: visible;
    }
    .share-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
    }
    .share-modal-content {
        position: relative;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 16px;
        width: 90%;
        max-width: 360px;
        overflow: hidden;
        transform: translateY(20px);
        transition: transform 0.3s;
    }
    #shareModal.active .share-modal-content {
        transform: translateY(0);
    }
    .share-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.2rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        color: #d4af37;
        font-weight: 500;
    }
    .share-close-btn {
        background: none;
        border: none;
        color: rgba(255,255,255,0.5);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    .share-close-btn:hover {
        color: #fff;
    }
    .share-modal-body {
        padding: 1.2rem;
    }
    .share-link-box {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.2rem;
    }
    .share-link-box input {
        flex: 1;
        padding: 0.6rem 0.8rem;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: #fff;
        font-size: 0.85rem;
    }
    .share-copy-btn {
        padding: 0.6rem 1rem;
        background: rgba(212, 175, 55, 0.2);
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 8px;
        color: #d4af37;
        cursor: pointer;
        font-size: 0.85rem;
        white-space: nowrap;
        transition: all 0.2s;
    }
    .share-copy-btn:hover {
        background: rgba(212, 175, 55, 0.3);
    }
    .share-qrcode-section {
        text-align: center;
    }
    .share-qrcode-label {
        font-size: 0.8rem;
        color: rgba(255,255,255,0.5);
        margin-bottom: 0.8rem;
    }
    .share-qrcode {
        display: inline-flex;
        padding: 0.8rem;
        background: #fff;
        border-radius: 8px;
    }
    .share-qrcode canvas,
    .share-qrcode img {
        display: block;
    }
    .share-qrcode-title {
        margin-top: 0.8rem;
        font-size: 0.85rem;
        color: #d4af37;
        font-weight: 500;
    }
`;
document.head.appendChild(shareStyles);
