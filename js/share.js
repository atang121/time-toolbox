/**
 * 社交分享功能
 * 基于 Share.js 实现多平台分享
 */

// 检测是否在微信内
function isWechat() {
    return /micromessenger/i.test(navigator.userAgent);
}

// 检测是否在QQ内
function isQQ() {
    return /\sQQ/i.test(navigator.userAgent);
}

// 分享当前工具
function shareCurrentTool() {
    const pageTitle = document.title || '时光工具箱';
    const toolName = pageTitle.split(' - ')[0] || '实用工具';
    showSharePanel(
        pageTitle,
        `推荐一个好用的工具：${toolName}，免费使用！`,
        window.location.href
    );
}

// 分享网站
function shareWebsite(title, text, url) {
    title = title || '时光工具箱 - 实用小工具集';
    text = text || '日期计算、农历转换、金额转换、短链接、二维码、图片压缩等实用工具，免费使用！';
    url = url || window.location.origin;
    showSharePanel(title, text, url);
}

// 显示分享面板
function showSharePanel(title, text, url) {
    // 如果在微信内，提示使用右上角分享
    if (isWechat()) {
        showWechatShareTip();
        return;
    }
    
    // 创建分享弹窗
    const modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.innerHTML = `
        <div class="share-modal-overlay" onclick="closeShareModal()"></div>
        <div class="share-modal-content">
            <div class="share-modal-header">
                <span><i class="fas fa-share-alt"></i> 分享给朋友</span>
                <button onclick="closeShareModal()" class="share-close-btn">&times;</button>
            </div>
            <div class="share-modal-body">
                <!-- 社交平台按钮 -->
                <div class="share-platforms">
                    <button class="share-platform-btn" onclick="shareTo('weibo', '${encodeURIComponent(title)}', '${encodeURIComponent(url)}')" title="分享到微博">
                        <i class="fab fa-weibo"></i>
                        <span>微博</span>
                    </button>
                    <button class="share-platform-btn" onclick="shareTo('qq', '${encodeURIComponent(title)}', '${encodeURIComponent(url)}', '${encodeURIComponent(text)}')" title="分享给QQ好友">
                        <i class="fab fa-qq"></i>
                        <span>QQ</span>
                    </button>
                    <button class="share-platform-btn" onclick="shareTo('qzone', '${encodeURIComponent(title)}', '${encodeURIComponent(url)}', '${encodeURIComponent(text)}')" title="分享到QQ空间">
                        <i class="fas fa-star"></i>
                        <span>QQ空间</span>
                    </button>
                    <button class="share-platform-btn" onclick="shareTo('douban', '${encodeURIComponent(title)}', '${encodeURIComponent(url)}')" title="分享到豆瓣">
                        <i class="fas fa-book"></i>
                        <span>豆瓣</span>
                    </button>
                </div>
                
                <!-- 微信分享区域 -->
                <div class="share-wechat-section">
                    <div class="share-wechat-title">
                        <i class="fab fa-weixin"></i> 微信分享
                    </div>
                    <div class="share-wechat-tip">打开微信扫一扫，分享给好友</div>
                    <div id="shareQrcode" class="share-qrcode"></div>
                    <div class="share-qrcode-title">时光工具箱</div>
                </div>
                
                <!-- 复制链接 -->
                <div class="share-link-section">
                    <div class="share-link-box">
                        <input type="text" id="shareUrlInput" value="${url}" readonly>
                        <button onclick="copyShareLink()" class="share-copy-btn">
                            <i class="fas fa-copy"></i> 复制链接
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('active'), 10);
    
    generateShareQrcode(url);
}

// 微信内分享提示
function showWechatShareTip() {
    const tip = document.createElement('div');
    tip.id = 'wechatShareTip';
    tip.innerHTML = `
        <div class="wechat-share-mask" onclick="closeWechatTip()"></div>
        <div class="wechat-share-guide">
            <div class="wechat-share-arrow">
                <i class="fas fa-long-arrow-alt-up"></i>
            </div>
            <div class="wechat-share-text">
                点击右上角<br>
                <strong>「 ··· 」</strong><br>
                选择「发送给朋友」<br>
                或「分享到朋友圈」
            </div>
            <button class="wechat-share-close" onclick="closeWechatTip()">我知道了</button>
        </div>
    `;
    document.body.appendChild(tip);
    setTimeout(() => tip.classList.add('active'), 10);
}

function closeWechatTip() {
    const tip = document.getElementById('wechatShareTip');
    if (tip) {
        tip.classList.remove('active');
        setTimeout(() => tip.remove(), 300);
    }
}

// 分享到各平台
function shareTo(platform, title, url, summary) {
    const shareUrls = {
        weibo: `https://service.weibo.com/share/share.php?title=${title}&url=${url}`,
        qq: `https://connect.qq.com/widget/shareqq/index.html?title=${title}&url=${url}&summary=${summary || title}`,
        qzone: `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?title=${title}&url=${url}&summary=${summary || title}`,
        douban: `https://www.douban.com/share/service?name=${title}&href=${url}`
    };
    
    const shareUrl = shareUrls[platform];
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=500');
    }
}

// 生成二维码
function generateShareQrcode(url) {
    const container = document.getElementById('shareQrcode');
    if (!container) return;
    
    if (typeof QRCode !== 'undefined') {
        new QRCode(container, {
            text: url,
            width: 140,
            height: 140,
            colorDark: '#1a1a2e',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });
    } else {
        const encodedUrl = encodeURIComponent(url);
        const img = document.createElement('img');
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodedUrl}`;
        img.alt = '二维码';
        img.style.cssText = 'width: 140px; height: 140px;';
        container.appendChild(img);
    }
}

// 复制链接
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

// 样式
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
        padding: 1rem;
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
        backdrop-filter: blur(5px);
    }
    .share-modal-content {
        position: relative;
        background: linear-gradient(145deg, #1e1e32, #16162a);
        border: 1px solid rgba(212, 175, 55, 0.2);
        border-radius: 20px;
        width: 100%;
        max-width: 400px;
        max-height: 90vh;
        overflow-y: auto;
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
        padding: 1.2rem 1.5rem;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        color: #d4af37;
        font-weight: 500;
        font-size: 1.1rem;
    }
    .share-modal-header i {
        margin-right: 0.5rem;
    }
    .share-close-btn {
        background: none;
        border: none;
        color: rgba(255,255,255,0.5);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
    }
    .share-close-btn:hover {
        color: #fff;
    }
    .share-modal-body {
        padding: 1.5rem;
    }
    
    /* 社交平台按钮 */
    .share-platforms {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }
    .share-platform-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.4rem;
        padding: 0.8rem 1rem;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        color: rgba(255,255,255,0.8);
        cursor: pointer;
        transition: all 0.2s;
        min-width: 70px;
    }
    .share-platform-btn:hover {
        background: rgba(255,255,255,0.1);
        transform: translateY(-2px);
    }
    .share-platform-btn i {
        font-size: 1.5rem;
    }
    .share-platform-btn span {
        font-size: 0.75rem;
    }
    .share-platform-btn:nth-child(1) i { color: #e6162d; }
    .share-platform-btn:nth-child(2) i { color: #12b7f5; }
    .share-platform-btn:nth-child(3) i { color: #f5c433; }
    .share-platform-btn:nth-child(4) i { color: #00b51d; }
    
    /* 微信分享区域 */
    .share-wechat-section {
        text-align: center;
        padding: 1.2rem;
        background: rgba(255,255,255,0.03);
        border-radius: 12px;
        margin-bottom: 1rem;
    }
    .share-wechat-title {
        color: #07c160;
        font-size: 1rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
    }
    .share-wechat-title i {
        margin-right: 0.3rem;
    }
    .share-wechat-tip {
        font-size: 0.8rem;
        color: rgba(255,255,255,0.5);
        margin-bottom: 1rem;
    }
    .share-qrcode {
        display: inline-flex;
        padding: 0.8rem;
        background: #fff;
        border-radius: 12px;
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
    
    /* 复制链接 */
    .share-link-section {
        margin-top: 1rem;
    }
    .share-link-box {
        display: flex;
        gap: 0.5rem;
    }
    .share-link-box input {
        flex: 1;
        padding: 0.7rem 0.9rem;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        color: #fff;
        font-size: 0.85rem;
    }
    .share-copy-btn {
        padding: 0.7rem 1rem;
        background: rgba(212, 175, 55, 0.2);
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 10px;
        color: #d4af37;
        cursor: pointer;
        font-size: 0.85rem;
        white-space: nowrap;
        transition: all 0.2s;
    }
    .share-copy-btn:hover {
        background: rgba(212, 175, 55, 0.3);
    }
    
    /* 微信内分享提示 */
    #wechatShareTip {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10001;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s;
    }
    #wechatShareTip.active {
        opacity: 1;
        visibility: visible;
    }
    .wechat-share-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
    }
    .wechat-share-guide {
        position: absolute;
        top: 0;
        right: 0;
        padding: 2rem;
        text-align: center;
        color: #fff;
    }
    .wechat-share-arrow {
        font-size: 3rem;
        color: #fff;
        animation: bounce 1s infinite;
    }
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    .wechat-share-text {
        font-size: 1rem;
        line-height: 1.8;
        margin: 1rem 0;
    }
    .wechat-share-text strong {
        color: #07c160;
        font-size: 1.2rem;
    }
    .wechat-share-close {
        padding: 0.8rem 2rem;
        background: #07c160;
        border: none;
        border-radius: 25px;
        color: #fff;
        font-size: 1rem;
        cursor: pointer;
        margin-top: 1rem;
    }
    
    @media (max-width: 480px) {
        .share-platform-btn {
            min-width: 60px;
            padding: 0.6rem 0.8rem;
        }
        .share-platform-btn i {
            font-size: 1.3rem;
        }
    }
`;
document.head.appendChild(shareStyles);
