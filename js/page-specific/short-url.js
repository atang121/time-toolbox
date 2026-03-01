/**
 * 短链接生成功能
 */

let currentShortUrl = '';

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

function setExampleUrl(url) {
    document.getElementById('urlInput').value = url;
}

async function generateShortUrl() {
    const input = document.getElementById('urlInput').value;
    const validation = validateUrl(input);
    
    if (!validation.valid) {
        showShortUrlError(validation.message);
        return;
    }
    
    const resultDiv = document.getElementById('shortUrlResult');
    const contentDiv = document.getElementById('shortUrlContent');
    
    resultDiv.style.display = 'block';
    contentDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';
    contentDiv.style.color = 'rgba(255,255,255,0.6)';
    
    gsap.from(resultDiv, { opacity: 0, y: 20, duration: 0.3 });
    
    const labelDiv = document.getElementById('shortUrlLabel');
    const actionsDiv = document.getElementById('shortUrlActions');
    
    try {
        const shortUrl = await tryShortUrlServices(validation.url);
        currentShortUrl = shortUrl;
        labelDiv.style.display = 'block';
        labelDiv.textContent = '短链接';
        actionsDiv.style.display = 'flex';
        contentDiv.innerHTML = currentShortUrl;
        contentDiv.style.color = '#d4af37';
    } catch (error) {
        currentShortUrl = validation.url;
        labelDiv.style.display = 'none';
        actionsDiv.style.display = 'none';
        contentDiv.innerHTML = `
            <div style="font-size: 0.9rem; color: #ff9f43; margin-bottom: 0.8rem;">
                <i class="fas fa-exclamation-triangle"></i> 在线服务暂不可用
            </div>
            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 1rem;">
                您可以手动访问以下网站生成短链接：
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-bottom: 1rem;">
                <a href="https://tinyurl.com/" target="_blank" class="manual-link-btn">TinyURL</a>
                <a href="https://bitly.com/" target="_blank" class="manual-link-btn">Bitly</a>
                <a href="https://www.shorturl.at/" target="_blank" class="manual-link-btn">ShortURL</a>
            </div>
            <button onclick="copyOriginalUrl()" class="action-btn" style="margin-top: 0.5rem;">
                <i class="fas fa-copy"></i> 复制原链接
            </button>
        `;
    }
}

async function tryShortUrlServices(longUrl) {
    const fetchWithTimeout = (url, options = {}, timeout = 8000) => {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('timeout')), timeout)
            )
        ]);
    };

    // 方案1: 使用 spoo.me API
    try {
        const response = await fetchWithTimeout('https://spoo.me/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: `url=${encodeURIComponent(longUrl)}`
        }, 8000);
        
        if (response.ok) {
            const data = await response.json();
            if (data.short_url) {
                return data.short_url;
            }
        }
    } catch (e) {
        console.log('spoo.me failed:', e);
    }

    // 方案2: 使用 CleanURI API
    try {
        const response = await fetchWithTimeout('https://cleanuri.com/api/v1/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `url=${encodeURIComponent(longUrl)}`
        }, 8000);
        
        if (response.ok) {
            const data = await response.json();
            if (data.result_url) {
                return data.result_url;
            }
        }
    } catch (e) {
        console.log('CleanURI failed:', e);
    }
    
    // 方案3: 使用 is.gd 通过 CORS 代理
    try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`)}`;
        const response = await fetchWithTimeout(proxyUrl, {}, 8000);
        
        if (response.ok) {
            const text = await response.text();
            if (text && text.startsWith('http') && !text.includes('Error')) {
                return text.trim();
            }
        }
    } catch (e) {
        console.log('is.gd via proxy failed:', e);
    }
    
    // 方案4: 使用 ulvis.net
    try {
        const response = await fetchWithTimeout(`https://ulvis.net/api.php?url=${encodeURIComponent(longUrl)}&private=1`, {}, 8000);
        
        if (response.ok) {
            const text = await response.text();
            if (text && text.startsWith('http')) {
                return text.trim();
            }
        }
    } catch (e) {
        console.log('ulvis.net failed:', e);
    }
    
    throw new Error('短链接服务不可用');
}

function copyShortUrl() {
    if (!currentShortUrl) return;
    
    navigator.clipboard.writeText(currentShortUrl).then(() => {
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

function copyOriginalUrl() {
    const input = document.getElementById('urlInput').value;
    const validation = validateUrl(input);
    if (!validation.valid) return;
    
    navigator.clipboard.writeText(validation.url).then(() => {
        const btn = event.target.closest('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> 已复制原链接';
        btn.style.background = 'rgba(0, 255, 100, 0.2)';
        btn.style.borderColor = 'rgba(0, 255, 100, 0.3)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.borderColor = 'rgba(255,255,255,0.2)';
        }, 2000);
    });
}

function openShortUrl() {
    if (!currentShortUrl) return;
    window.open(currentShortUrl, '_blank');
}

function showShortUrlError(message) {
    const resultDiv = document.getElementById('shortUrlResult');
    const contentDiv = document.getElementById('shortUrlContent');
    const labelDiv = document.getElementById('shortUrlLabel');
    const actionsDiv = document.getElementById('shortUrlActions');
    
    resultDiv.style.display = 'block';
    labelDiv.style.display = 'none';
    actionsDiv.style.display = 'none';
    contentDiv.innerHTML = `<span style="color: #ff6b6b;">${message}</span>`;
    
    gsap.from(resultDiv, { opacity: 0, y: 20, duration: 0.3 });
}

document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    if (urlInput) {
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                generateShortUrl();
            }
        });
    }
});
