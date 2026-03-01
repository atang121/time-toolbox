/**
 * 图片格式转换功能
 */

let selectedFiles = [];
let targetFormat = 'jpeg';
let quality = 0.9;

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    
    // 检测微信浏览器
    if (/MicroMessenger/i.test(navigator.userAgent)) {
        const tip = document.getElementById('wechatTip');
        if (tip) tip.style.display = 'block';
    }
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
});

function handleFiles(files) {
    selectedFiles = Array.from(files).filter(file => 
        file.type === 'image/jpeg' || 
        file.type === 'image/png' || 
        file.type === 'image/webp'
    );
    
    if (selectedFiles.length === 0) {
        alert('请选择有效的图片文件（JPG、PNG、WebP）');
        return;
    }
    
    const previewArea = document.getElementById('previewArea');
    const previewList = document.getElementById('previewList');
    const convertBtn = document.getElementById('convertBtn');
    
    previewList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `<img src="${e.target.result}" alt="预览">`;
            previewList.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
    
    previewArea.style.display = 'block';
    convertBtn.style.display = 'block';
    document.getElementById('resultArea').style.display = 'none';
    
    gsap.from(previewArea, { opacity: 0, y: 20, duration: 0.3 });
}

function setFormat(format) {
    targetFormat = format;
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.format === format) {
            btn.classList.add('active');
        }
    });
    
    const qualitySection = document.getElementById('qualitySection');
    if (format === 'png') {
        qualitySection.style.opacity = '0.5';
    } else {
        qualitySection.style.opacity = '1';
    }
}

function updateQuality(value) {
    quality = value / 100;
    document.getElementById('qualityValue').textContent = value;
}

async function convertImages() {
    if (selectedFiles.length === 0) return;
    
    const resultArea = document.getElementById('resultArea');
    const resultList = document.getElementById('resultList');
    
    resultList.innerHTML = '<div style="color: rgba(255,255,255,0.6);"><i class="fas fa-spinner fa-spin"></i> 转换中...</div>';
    resultArea.style.display = 'block';
    
    gsap.from(resultArea, { opacity: 0, y: 20, duration: 0.3 });
    
    const results = [];
    
    for (const file of selectedFiles) {
        try {
            const converted = await convertImage(file);
            results.push(converted);
        } catch (error) {
            console.error('转换失败:', error);
        }
    }
    
    resultList.innerHTML = '';
    
    if (results.length === 0) {
        resultList.innerHTML = '<div style="color: #ff6b6b;">转换失败，请重试</div>';
        return;
    }
    
    convertedResults = results;
    
    results.forEach((result, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <span style="font-size: 0.85rem; color: rgba(255,255,255,0.8); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">
                ${result.name}
            </span>
            <button class="download-btn" onclick="downloadFile('${result.dataUrl}', '${result.name}')">
                <i class="fas fa-download"></i> 下载
            </button>
        `;
        resultList.appendChild(div);
    });
    
    if (results.length > 1) {
        const downloadAllDiv = document.createElement('div');
        downloadAllDiv.style.marginTop = '1rem';
        downloadAllDiv.innerHTML = `
            <button class="btn-primary" onclick="downloadAll()" style="padding: 0.6rem 1rem; font-size: 0.9rem;">
                <i class="fas fa-download"></i> 全部下载（压缩包）
            </button>
        `;
        resultList.appendChild(downloadAllDiv);
    }
}

function convertImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                
                if (targetFormat === 'jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                ctx.drawImage(img, 0, 0);
                
                const mimeType = `image/${targetFormat}`;
                const dataUrl = canvas.toDataURL(mimeType, targetFormat === 'png' ? 1 : quality);
                
                const originalName = file.name.replace(/\.[^/.]+$/, '');
                const extension = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
                const newName = `${originalName}.${extension}`;
                
                resolve({
                    name: newName,
                    dataUrl: dataUrl
                });
            };
            
            img.onerror = reject;
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

let convertedResults = [];

function downloadFile(dataUrl, filename) {
    try {
        // 将 dataUrl 转为 Blob
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        
        // 使用 FileSaver.js 下载
        if (typeof saveAs !== 'undefined') {
            saveAs(blob, filename);
        } else {
            downloadBlob(blob, filename);
        }
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

async function downloadAll() {
    if (convertedResults.length === 0) return;
    
    const btn = event.target.closest('button');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 打包中...';
    btn.disabled = true;
    
    try {
        if (typeof JSZip === 'undefined') {
            throw new Error('压缩库未加载');
        }
        
        const zip = new JSZip();
        
        for (const result of convertedResults) {
            const base64Data = result.dataUrl.split(',')[1];
            zip.file(result.name, base64Data, { base64: true });
        }
        
        const content = await zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });
        
        // 使用 FileSaver.js 下载
        if (typeof saveAs !== 'undefined') {
            saveAs(content, '转换后的图片.zip');
        } else {
            downloadBlob(content, '转换后的图片.zip');
        }
        
        btn.innerHTML = '<i class="fas fa-check"></i> 下载完成';
        btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-download"></i> 全部下载（压缩包）';
            btn.style.background = '';
            btn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('打包失败:', error);
        alert('打包失败: ' + error.message);
        btn.innerHTML = '<i class="fas fa-download"></i> 全部下载（压缩包）';
        btn.disabled = false;
    }
}
