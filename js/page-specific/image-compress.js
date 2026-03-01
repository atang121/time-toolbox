/**
 * 图片压缩工具
 */

let selectedFiles = [];
let compressMode = 'quality';

document.addEventListener('DOMContentLoaded', function() {
    console.log('[image-compress] 初始化开始');
    
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    if (!dropZone || !fileInput) {
        console.error('[image-compress] 找不到必要元素');
        return;
    }
    
    // 拖拽事件
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    
    // 文件选择事件
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    // 尺寸联动
    const widthInput = document.getElementById('resizeWidth');
    const heightInput = document.getElementById('resizeHeight');
    const keepRatio = document.getElementById('keepRatio');
    
    if (widthInput && heightInput) {
        widthInput.addEventListener('input', function() {
            if (keepRatio && keepRatio.checked && window.currentImageRatio) {
                const newHeight = Math.round(this.value / window.currentImageRatio);
                heightInput.value = newHeight || '';
            }
        });
        
        heightInput.addEventListener('input', function() {
            if (keepRatio && keepRatio.checked && window.currentImageRatio) {
                const newWidth = Math.round(this.value * window.currentImageRatio);
                widthInput.value = newWidth || '';
            }
        });
    }
    
    console.log('[image-compress] 初始化完成');
});

function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    selectedFiles = [];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    for (let file of files) {
        if (validTypes.includes(file.type)) {
            selectedFiles.push(file);
        }
    }
    
    if (selectedFiles.length === 0) {
        alert('请选择 JPG、PNG 或 WebP 格式的图片');
        return;
    }
    
    // 更新显示区域（不替换整个 dropZone）
    const dropZoneText = document.getElementById('dropZoneText');
    if (dropZoneText) {
        dropZoneText.innerHTML = `
            <i class="fas fa-images" style="font-size: 2.5rem; color: #d4af37; margin-bottom: 0.8rem;"></i>
            <p>已选择 ${selectedFiles.length} 张图片</p>
            <p style="font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 0.5rem;">点击可重新选择</p>
        `;
    }
    
    // 显示压缩选项
    document.getElementById('compressOptions').style.display = 'block';
    
    // 隐藏之前的结果
    document.getElementById('resultArea').style.display = 'none';
    
    // 获取第一张图片的尺寸作为参考
    getImageDimensions(selectedFiles[0]).then(dim => {
        document.getElementById('resizeWidth').placeholder = `宽 ${dim.width}`;
        document.getElementById('resizeHeight').placeholder = `高 ${dim.height}`;
        window.currentImageRatio = dim.width / dim.height;
    });
    
    // 清空文件输入以便再次选择相同文件
    document.getElementById('fileInput').value = '';
}

function getImageDimensions(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            resolve({ width: this.width, height: this.height });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = function() {
            resolve({ width: 0, height: 0 });
        };
        img.src = URL.createObjectURL(file);
    });
}

function setCompressMode(mode) {
    compressMode = mode;
    
    // 更新按钮状态
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // 显示/隐藏设置
    document.getElementById('qualitySettings').style.display = mode === 'quality' ? 'block' : 'none';
    document.getElementById('sizeSettings').style.display = mode === 'size' ? 'block' : 'none';
}

function updateQuality(value) {
    document.getElementById('qualityValue').textContent = value;
}

function toggleResize() {
    const enabled = document.getElementById('resizeEnabled').checked;
    document.getElementById('resizeOptions').style.display = enabled ? 'flex' : 'none';
}

async function compressImages() {
    if (selectedFiles.length === 0) {
        alert('请先选择图片');
        return;
    }
    
    const btn = document.querySelector('.btn-primary');
    if (btn.disabled) {
        console.log('[image-compress] 按钮已禁用，跳过');
        return;
    }
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 压缩中...';
    
    const results = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> 压缩中 ${i + 1}/${selectedFiles.length}`;
        
        try {
            const result = await compressImage(selectedFiles[i]);
            results.push(result);
        } catch (error) {
            console.error('[image-compress] 压缩失败:', selectedFiles[i].name, error);
            results.push({
                name: selectedFiles[i].name,
                error: error.message
            });
        }
    }
    
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-compress"></i> 开始压缩';
    
    showResults(results);
}

async function compressImage(file) {
    const quality = compressMode === 'quality' 
        ? parseInt(document.getElementById('qualitySlider').value) / 100
        : 0.9;
    
    const targetSizeKB = compressMode === 'size' 
        ? parseFloat(document.getElementById('targetSize').value) * 
          (document.getElementById('sizeUnit').value === 'mb' ? 1024 : 1)
        : null;
    
    const resizeEnabled = document.getElementById('resizeEnabled').checked;
    const targetWidth = resizeEnabled ? parseInt(document.getElementById('resizeWidth').value) : null;
    const targetHeight = resizeEnabled ? parseInt(document.getElementById('resizeHeight').value) : null;
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async function() {
            try {
                let result;
                
                if (compressMode === 'size' && targetSizeKB) {
                    result = await compressToTargetSize(img, file, targetSizeKB, targetWidth, targetHeight);
                } else {
                    result = await compressWithQuality(img, file, quality, targetWidth, targetHeight);
                }
                
                URL.revokeObjectURL(img.src);
                resolve(result);
            } catch (error) {
                URL.revokeObjectURL(img.src);
                reject(error);
            }
        };
        img.onerror = function() {
            URL.revokeObjectURL(img.src);
            reject(new Error('图片加载失败'));
        };
        img.src = URL.createObjectURL(file);
    });
}

async function compressWithQuality(img, file, quality, targetWidth, targetHeight) {
    let width = img.width;
    let height = img.height;
    
    // 处理尺寸调整
    if (targetWidth || targetHeight) {
        const ratio = img.width / img.height;
        
        if (targetWidth && targetHeight) {
            width = targetWidth;
            height = targetHeight;
        } else if (targetWidth) {
            width = targetWidth;
            height = Math.round(targetWidth / ratio);
        } else {
            height = targetHeight;
            width = Math.round(targetHeight * ratio);
        }
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    // 对于 JPEG 输出，填充白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    
    // 统一转为 JPEG 格式以获得更好的压缩效果
    // PNG 用 canvas 压缩效果很差，转为 JPEG 才能有效压缩
    const outputType = 'image/jpeg';
    
    const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, outputType, quality);
    });
    
    const originalSize = file.size / 1024;
    const compressedSize = blob.size / 1024;
    
    // 如果压缩后反而变大，且质量设置较高，尝试用更低的质量
    let finalBlob = blob;
    let finalSize = compressedSize;
    
    if (compressedSize >= originalSize && quality > 0.5) {
        // 尝试更低的质量
        const lowerQualityBlob = await new Promise(resolve => {
            canvas.toBlob(resolve, outputType, 0.7);
        });
        if (lowerQualityBlob.size / 1024 < originalSize) {
            finalBlob = lowerQualityBlob;
            finalSize = lowerQualityBlob.size / 1024;
        }
    }
    
    const saved = ((1 - finalSize / originalSize) * 100).toFixed(1);
    
    return {
        name: file.name,
        originalSize: originalSize,
        compressedSize: finalSize,
        saved: saved,
        originalDimensions: { width: img.width, height: img.height },
        newDimensions: { width: width, height: height },
        blob: finalBlob,
        type: outputType,
        increased: finalSize > originalSize
    };
}

async function compressToTargetSize(img, file, targetSizeKB, targetWidth, targetHeight) {
    let quality = 0.9;
    let result;
    let attempts = 0;
    const maxAttempts = 15;
    
    // 先尝试当前质量
    result = await compressWithQuality(img, file, quality, targetWidth, targetHeight);
    
    // 如果已经在目标范围内，直接返回
    if (result.compressedSize <= targetSizeKB) {
        return result;
    }
    
    // 二分法调整质量
    let minQ = 0.1;
    let maxQ = 0.9;
    
    while (attempts < maxAttempts) {
        quality = (minQ + maxQ) / 2;
        result = await compressWithQuality(img, file, quality, targetWidth, targetHeight);
        
        if (Math.abs(result.compressedSize - targetSizeKB) < targetSizeKB * 0.05) {
            break;
        }
        
        if (result.compressedSize > targetSizeKB) {
            maxQ = quality;
        } else {
            minQ = quality;
        }
        
        attempts++;
    }
    
    // 如果质量已经很低但仍然超过目标，需要缩小尺寸
    if (result.compressedSize > targetSizeKB && quality <= 0.15) {
        const scale = Math.sqrt(targetSizeKB / result.compressedSize);
        const newWidth = Math.round((targetWidth || img.width) * scale);
        const newHeight = Math.round((targetHeight || img.height) * scale);
        
        result = await compressWithQuality(img, file, 0.7, newWidth, newHeight);
    }
    
    return result;
}

function showResults(results) {
    const resultArea = document.getElementById('resultArea');
    const resultList = document.getElementById('resultList');
    
    resultArea.style.display = 'block';
    resultList.innerHTML = '';
    
    // 计算总体统计
    let totalOriginal = 0;
    let totalCompressed = 0;
    let successCount = 0;
    
    results.forEach((result, index) => {
        if (!result.error) {
            totalOriginal += result.originalSize;
            totalCompressed += result.compressedSize;
            successCount++;
        }
    });
    
    // 总体统计卡片
    if (successCount > 1) {
        const totalSaved = ((1 - totalCompressed / totalOriginal) * 100).toFixed(1);
        const savedColor = parseFloat(totalSaved) >= 0 ? '#4CAF50' : '#ff9800';
        const savedText = parseFloat(totalSaved) >= 0 ? `节省 ${totalSaved}%` : `增加 ${Math.abs(totalSaved)}%`;
        
        const summaryHtml = `
            <div class="result-card" style="background: rgba(212, 175, 55, 0.1); border-color: rgba(212, 175, 55, 0.3); margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                    <div>
                        <span style="color: #d4af37; font-size: 0.85rem;"><i class="fas fa-chart-pie"></i> 压缩完成</span>
                        <span style="margin-left: 0.5rem; color: rgba(255,255,255,0.6); font-size: 0.8rem;">${successCount} 张图片</span>
                    </div>
                    <div style="font-size: 0.8rem;">
                        <span style="color: rgba(255,255,255,0.6);">${formatSize(totalOriginal)} → </span>
                        <span style="color: ${savedColor};">${formatSize(totalCompressed)}</span>
                        <span style="color: ${savedColor}; margin-left: 0.3rem;">${savedText}</span>
                    </div>
                </div>
                <button class="download-btn" style="width: 100%; margin-top: 0.8rem;" onclick="downloadAll()">
                    <i class="fas fa-download"></i> 下载全部压缩后的图片
                </button>
            </div>
        `;
        resultList.innerHTML += summaryHtml;
    }
    
    // 各图片结果
    results.forEach((result, index) => {
        if (result.error) {
            resultList.innerHTML += `
                <div class="result-card" style="border-color: rgba(255, 82, 82, 0.3);">
                    <div class="result-card-header">
                        <span class="result-card-name"><i class="fas fa-exclamation-circle" style="color: #ff5252;"></i> ${result.name}</span>
                    </div>
                    <p style="font-size: 0.8rem; color: #ff5252;">压缩失败: ${result.error}</p>
                </div>
            `;
            return;
        }
        
        const savedValue = parseFloat(result.saved);
        const savedColor = savedValue >= 0 ? '#4CAF50' : '#ff9800';
        const savedText = savedValue >= 0 ? `${result.saved}%` : `+${Math.abs(savedValue)}%`;
        const warningNote = result.increased ? `<p style="font-size: 0.75rem; color: #ff9800; margin-top: 0.5rem;"><i class="fas fa-info-circle"></i> 原图已高度压缩，建议使用原图或降低质量</p>` : '';
        
        const html = `
            <div class="result-card" data-index="${index}">
                <div class="result-card-header">
                    <span class="result-card-name" title="${result.name}"><i class="fas fa-image"></i> ${result.name}</span>
                    <button class="download-btn" onclick="downloadSingle(${index})">
                        <i class="fas fa-download"></i> 下载
                    </button>
                </div>
                <div class="result-card-stats">
                    <div class="stat-item">
                        <span class="stat-label">原大小</span>
                        <span class="stat-value">${formatSize(result.originalSize)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">压缩后</span>
                        <span class="stat-value" style="color: ${savedColor};">${formatSize(result.compressedSize)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">变化</span>
                        <span class="stat-value" style="color: ${savedColor};">${savedText}</span>
                    </div>
                    ${result.originalDimensions.width !== result.newDimensions.width ? `
                    <div class="stat-item">
                        <span class="stat-label">尺寸</span>
                        <span class="stat-value">${result.newDimensions.width}×${result.newDimensions.height}</span>
                    </div>
                    ` : ''}
                </div>
                ${warningNote}
            </div>
        `;
        resultList.innerHTML += html;
    });
    
    // 存储结果供下载使用
    window.compressResults = results;
}

function formatSize(sizeKB) {
    if (sizeKB >= 1024) {
        return (sizeKB / 1024).toFixed(2) + ' MB';
    }
    return sizeKB.toFixed(1) + ' KB';
}

function downloadSingle(index) {
    const result = window.compressResults[index];
    if (!result || !result.blob) return;
    
    const baseName = result.name.replace(/\.[^.]+$/, '');
    const fileName = `${baseName}_compressed.jpg`;
    
    if (typeof saveAs !== 'undefined') {
        saveAs(result.blob, fileName);
    } else {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

async function downloadAll() {
    const results = window.compressResults;
    if (!results || results.length === 0) return;
    
    const btn = document.querySelector('.result-card button[onclick="downloadAll()"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 打包中...';
    }
    
    try {
        if (typeof JSZip === 'undefined') {
            for (let i = 0; i < results.length; i++) {
                if (results[i].blob) {
                    downloadSingle(i);
                    await new Promise(r => setTimeout(r, 300));
                }
            }
            return;
        }
        
        const zip = new JSZip();
        
        results.forEach((result, index) => {
            if (result.blob) {
                const baseName = result.name.replace(/\.[^.]+$/, '');
                const fileName = `${baseName}_compressed.jpg`;
                zip.file(fileName, result.blob);
            }
        });
        
        const content = await zip.generateAsync({ type: 'blob' });
        const timestamp = new Date().toISOString().slice(0, 10);
        saveAs(content, `compressed_images_${timestamp}.zip`);
        
    } catch (error) {
        console.error('[image-compress] 下载失败:', error);
        alert('下载失败，请尝试单独下载');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-download"></i> 下载全部压缩后的图片';
        }
    }
}
