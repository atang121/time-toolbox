/**
 * 批量改名功能
 */

let selectedFiles = [];
let numberFormat = '1';
let isWechat = false;

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    
    // 检测微信浏览器
    isWechat = /MicroMessenger/i.test(navigator.userAgent);
    if (isWechat) {
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
    selectedFiles = Array.from(files);
    
    if (selectedFiles.length === 0) {
        return;
    }
    
    document.getElementById('renameSettings').style.display = 'block';
    document.getElementById('previewArea').style.display = 'block';
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('fileCount').textContent = selectedFiles.length;
    
    gsap.from('#renameSettings', { opacity: 0, y: 20, duration: 0.3 });
    
    updatePreview();
}

function setNumberFormat(format) {
    numberFormat = format;
    
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.format === format) {
            btn.classList.add('active');
        }
    });
    
    updatePreview();
}

function formatNumber(num) {
    if (numberFormat === '01') {
        return num.toString().padStart(2, '0');
    } else if (numberFormat === '001') {
        return num.toString().padStart(3, '0');
    }
    return num.toString();
}

function getNewFileName(originalName, index) {
    const prefix = document.getElementById('prefixInput').value;
    const suffix = document.getElementById('suffixInput').value;
    const baseName = document.getElementById('baseNameInput').value || '文件';
    const startNumber = parseInt(document.getElementById('startNumber').value) || 1;
    const keepExtension = document.getElementById('keepExtension').checked;
    
    let extension = '';
    if (keepExtension) {
        const lastDot = originalName.lastIndexOf('.');
        if (lastDot > 0) {
            extension = originalName.substring(lastDot);
        }
    }
    
    const number = formatNumber(startNumber + index);
    
    return `${prefix}${baseName}${number}${suffix}${extension}`;
}

function updatePreview() {
    const previewList = document.getElementById('previewList');
    previewList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const newName = getNewFileName(file.name, index);
        
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
            <span class="original-name" title="${file.name}">${file.name}</span>
            <span class="arrow"><i class="fas fa-arrow-right"></i></span>
            <span class="new-name" title="${newName}">${newName}</span>
        `;
        previewList.appendChild(div);
    });
}

async function downloadRenamed() {
    if (selectedFiles.length === 0) {
        showDownloadError('请先选择文件');
        return;
    }
    
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 打包中...';
    downloadBtn.disabled = true;
    
    try {
        // 检查 JSZip 是否加载
        if (typeof JSZip === 'undefined') {
            throw new Error('压缩库未加载，请刷新页面重试');
        }
        
        const zip = new JSZip();
        
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const newName = getNewFileName(file.name, i);
            
            const arrayBuffer = await readFileAsArrayBuffer(file);
            zip.file(newName, arrayBuffer);
        }
        
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成压缩包...';
        
        const content = await zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });
        
        // 使用 FileSaver.js 下载（兼容性更好）
        if (typeof saveAs !== 'undefined') {
            saveAs(content, '重命名文件.zip');
        } else {
            // 备用方案
            downloadBlob(content, '重命名文件.zip');
        }
        
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> 下载完成';
        downloadBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        
        setTimeout(() => {
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载重命名后的文件（压缩包）';
            downloadBtn.style.background = '';
            downloadBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('打包失败:', error);
        showDownloadError(error.message || '打包失败，请重试');
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载重命名后的文件（压缩包）';
        downloadBtn.disabled = false;
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    
    // 方法1: 创建链接点击
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // 延迟清理
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

function showDownloadError(message) {
    // 查找或创建错误提示
    let errorDiv = document.getElementById('downloadError');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'downloadError';
        errorDiv.style.cssText = 'margin-top: 1rem; padding: 0.8rem 1rem; background: rgba(244, 67, 54, 0.15); border: 1px solid rgba(244, 67, 54, 0.3); border-radius: 8px; font-size: 0.85rem; color: #ef5350;';
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.parentNode.insertBefore(errorDiv, downloadBtn.nextSibling);
    }
    errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + message;
    errorDiv.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('文件读取失败: ' + file.name));
        reader.readAsArrayBuffer(file);
    });
}
