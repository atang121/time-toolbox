/**
 * 时光信箱 - 用户反馈模块
 * 支持 Google Sheets / Formspree 等 Webhook 方式收集反馈
 */

(function() {
    // ========== 配置区域 ==========
    // 请将下面的 URL 替换为你的 Google Apps Script Web App URL
    // 配置方法见下方注释
    const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxcOy2ZlGO4Hk5y1S9otudxklhfdxJ_8vAkhjftAtY6NJyZTP7YGdd_6OG7GqJtQeZ7/exec';
    
    // 备用：开发者邮箱（当 WEBHOOK 未配置时使用 mailto）
    const FEEDBACK_EMAIL = '1271398154@qq.com';
    // ========== 配置结束 ==========
    
    /*
    ============ Google Sheets 配置步骤 ============
    
    1. 打开 Google Sheets：https://sheets.google.com
    2. 新建一个表格，命名为"时光工具箱-用户反馈"
    3. 在第一行添加表头：时间 | 类型 | 页面 | 内容 | 联系方式
    4. 点击菜单：扩展程序 → Apps 脚本
    5. 删除默认代码，粘贴以下代码：
    
    ------- 复制以下代码 -------
    function doPost(e) {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      var data = JSON.parse(e.postData.contents);
      
      sheet.appendRow([
        new Date().toLocaleString('zh-CN'),
        data.type || '',
        data.page || '',
        data.content || '',
        data.contact || ''
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    function doGet(e) {
      return ContentService.createTextOutput('Feedback API is running');
    }
    ------- 代码结束 -------
    
    6. 点击"部署" → "新建部署"
    7. 类型选择"Web 应用"
    8. 执行身份：选择你自己
    9. 谁可以访问：选择"任何人"
    10. 点击"部署"，复制生成的 URL
    11. 将 URL 粘贴到上面的 WEBHOOK_URL 中
    
    =============================================
    */
    
    let currentFeedbackType = 'bug';
    
    // 样式
    const styles = `
        .feedback-float-btn {
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #d4af37, #b8960c);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
            z-index: 9999;
            transition: all 0.3s ease;
            border: none;
        }
        .feedback-float-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(212, 175, 55, 0.6);
        }
        .feedback-float-btn i {
            font-size: 1.3rem;
            color: #1a1a2e;
        }
        .feedback-float-btn .btn-tooltip {
            position: absolute;
            right: 60px;
            background: rgba(30, 30, 50, 0.95);
            color: #fff;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }
        .feedback-float-btn:hover .btn-tooltip {
            opacity: 1;
        }
        
        .feedback-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        .feedback-modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .feedback-modal {
            background: linear-gradient(145deg, #1e1e32, #16162a);
            border-radius: 20px;
            border: 1px solid rgba(212, 175, 55, 0.2);
            max-width: 450px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
        .feedback-modal-overlay.active .feedback-modal {
            transform: translateY(0);
        }
        
        .feedback-header {
            padding: 1.5rem 1.5rem 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .feedback-header h3 {
            color: #d4af37;
            font-size: 1.2rem;
            font-family: 'Noto Serif SC', serif;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0;
        }
        .feedback-close {
            background: none;
            border: none;
            color: rgba(255,255,255,0.5);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            transition: color 0.2s;
        }
        .feedback-close:hover {
            color: #fff;
        }
        
        .feedback-body {
            padding: 1.5rem;
        }
        .feedback-intro {
            color: rgba(255,255,255,0.7);
            font-size: 0.9rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }
        .feedback-intro i {
            color: #d4af37;
        }
        
        .feedback-type-group {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.2rem;
            flex-wrap: wrap;
        }
        .feedback-type-btn {
            flex: 1;
            min-width: 80px;
            padding: 0.7rem 0.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            color: rgba(255,255,255,0.7);
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
        }
        .feedback-type-btn:hover {
            background: rgba(255,255,255,0.08);
        }
        .feedback-type-btn.active {
            background: rgba(212, 175, 55, 0.15);
            border-color: rgba(212, 175, 55, 0.4);
            color: #d4af37;
        }
        .feedback-type-btn i {
            display: block;
            font-size: 1.2rem;
            margin-bottom: 0.3rem;
        }
        
        .feedback-form-group {
            margin-bottom: 1rem;
        }
        .feedback-form-group label {
            display: block;
            color: rgba(255,255,255,0.7);
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
        }
        .feedback-form-group label .optional {
            color: rgba(255,255,255,0.4);
            font-size: 0.75rem;
        }
        .feedback-form-group textarea,
        .feedback-form-group input {
            width: 100%;
            padding: 0.8rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            color: #fff;
            font-size: 0.9rem;
            resize: vertical;
            transition: border-color 0.2s;
            box-sizing: border-box;
        }
        .feedback-form-group textarea:focus,
        .feedback-form-group input:focus {
            outline: none;
            border-color: rgba(212, 175, 55, 0.5);
        }
        .feedback-form-group textarea {
            min-height: 120px;
        }
        .feedback-form-group textarea::placeholder,
        .feedback-form-group input::placeholder {
            color: rgba(255,255,255,0.3);
        }
        
        .feedback-submit {
            width: 100%;
            padding: 0.9rem;
            background: linear-gradient(135deg, #d4af37, #b8960c);
            border: none;
            border-radius: 10px;
            color: #1a1a2e;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        .feedback-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(212, 175, 55, 0.4);
        }
        .feedback-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .feedback-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid rgba(255,255,255,0.05);
            text-align: center;
        }
        .feedback-footer p {
            color: rgba(255,255,255,0.4);
            font-size: 0.75rem;
            margin: 0;
        }
        .feedback-footer i {
            color: #e74c3c;
        }
        
        .feedback-success {
            text-align: center;
            padding: 2rem;
        }
        .feedback-success i {
            font-size: 3rem;
            color: #4CAF50;
            margin-bottom: 1rem;
        }
        .feedback-success h4 {
            color: #fff;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
        }
        .feedback-success p {
            color: rgba(255,255,255,0.6);
            font-size: 0.9rem;
        }
        
        @media (max-width: 480px) {
            .feedback-float-btn {
                bottom: 80px;
                right: 15px;
                width: 45px;
                height: 45px;
            }
            .feedback-float-btn i {
                font-size: 1.1rem;
            }
            .feedback-type-btn {
                min-width: 70px;
                padding: 0.6rem 0.4rem;
                font-size: 0.75rem;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    // 打开弹窗
    window.openFeedbackModal = function() {
        const modal = document.getElementById('feedbackModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };
    
    // 关闭弹窗
    window.closeFeedbackModal = function() {
        const modal = document.getElementById('feedbackModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };
    
    // 设置反馈类型
    window.setFeedbackType = function(type) {
        currentFeedbackType = type;
        document.querySelectorAll('.feedback-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        
        const textarea = document.getElementById('feedbackContent');
        if (textarea) {
            const placeholders = {
                'bug': '请描述你遇到的问题，比如：哪个功能不正常、出现了什么错误...',
                'suggestion': '请分享你的改进建议，比如：界面优化、功能增强、体验提升...',
                'feature': '请描述你想要的新工具，比如：工具名称、使用场景、期望功能...'
            };
            textarea.placeholder = placeholders[type] || placeholders['bug'];
        }
    };
    
    // 提交反馈
    window.submitFeedback = async function() {
        const contentEl = document.getElementById('feedbackContent');
        const contactEl = document.getElementById('feedbackContact');
        const submitBtn = document.querySelector('.feedback-submit');
        
        if (!contentEl) return;
        
        const content = contentEl.value.trim();
        const contact = contactEl ? contactEl.value.trim() : '';
        
        if (!content) {
            alert('请填写反馈内容');
            return;
        }
        
        const typeNames = {
            'bug': '问题反馈',
            'suggestion': '改进建议',
            'feature': '新工具需求'
        };
        
        const typeName = typeNames[currentFeedbackType] || '反馈';
        const currentPage = document.title || window.location.pathname;
        
        // 禁用按钮
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';
        }
        
        // 如果配置了 Webhook，使用 API 提交
        if (WEBHOOK_URL) {
            try {
                const response = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors',  // Google Apps Script 需要
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: typeName,
                        page: currentPage,
                        content: content,
                        contact: contact
                    })
                });
                
                // no-cors 模式下无法读取响应，但请求已发送
                showFeedbackSuccess('感谢你的反馈！', '已收到，我会认真查看~');
                
            } catch (error) {
                console.error('[feedback] 提交失败:', error);
                // 降级到邮件方式
                fallbackToEmail(typeName, currentPage, content, contact);
            }
        } else {
            // 未配置 Webhook，使用邮件方式
            fallbackToEmail(typeName, currentPage, content, contact);
        }
        
        // 恢复按钮
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 发送反馈';
        }
    };
    
    // 邮件降级方案
    function fallbackToEmail(typeName, currentPage, content, contact) {
        const subject = `【时光工具箱】${typeName}`;
        const body = `反馈类型：${typeName}
当前页面：${currentPage}
${contact ? '联系方式：' + contact : ''}

反馈内容：
${content}

---
发送时间：${new Date().toLocaleString('zh-CN')}`;
        
        const mailtoLink = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        showFeedbackSuccess('感谢你的反馈！', '正在打开邮件...');
        
        setTimeout(() => {
            window.location.href = mailtoLink;
        }, 300);
    }
    
    // 显示成功状态
    function showFeedbackSuccess(title, message) {
        const body = document.getElementById('feedbackBody');
        if (body) {
            body.innerHTML = `
                <div class="feedback-success">
                    <i class="fas fa-check-circle"></i>
                    <h4>${title || '感谢你的反馈！'}</h4>
                    <p>${message || '我会认真查看每一条反馈~'}</p>
                </div>
            `;
        }
        
        setTimeout(() => {
            closeFeedbackModal();
            setTimeout(resetFeedbackForm, 300);
        }, 2000);
    }
    
    // 重置表单
    function resetFeedbackForm() {
        const body = document.getElementById('feedbackBody');
        if (body) {
            body.innerHTML = getFeedbackFormHTML();
        }
        currentFeedbackType = 'bug';
    }
    
    // 获取表单HTML
    function getFeedbackFormHTML() {
        return `
            <p class="feedback-intro">
                <i class="fas fa-heart"></i> 感谢你使用时光工具箱！<br>
                遇到问题、有好建议、或想要新功能？欢迎告诉我~
            </p>
            
            <div class="feedback-type-group">
                <button type="button" class="feedback-type-btn active" data-type="bug" onclick="setFeedbackType('bug')">
                    <i class="fas fa-bug"></i>
                    问题反馈
                </button>
                <button type="button" class="feedback-type-btn" data-type="suggestion" onclick="setFeedbackType('suggestion')">
                    <i class="fas fa-lightbulb"></i>
                    改进建议
                </button>
                <button type="button" class="feedback-type-btn" data-type="feature" onclick="setFeedbackType('feature')">
                    <i class="fas fa-magic"></i>
                    新工具需求
                </button>
            </div>
            
            <div class="feedback-form-group">
                <label>反馈内容</label>
                <textarea id="feedbackContent" placeholder="请描述你遇到的问题或建议..."></textarea>
            </div>
            
            <div class="feedback-form-group">
                <label>联系方式 <span class="optional">（选填，方便回复你）</span></label>
                <input type="text" id="feedbackContact" placeholder="邮箱 / 微信 / 手机">
            </div>
            
            <button class="feedback-submit" onclick="submitFeedback()">
                <i class="fas fa-paper-plane"></i> 发送反馈
            </button>
        `;
    }
    
    // 初始化
    function initFeedback() {
        if (document.getElementById('feedbackFloatBtn')) return;
        
        const floatBtn = document.createElement('button');
        floatBtn.id = 'feedbackFloatBtn';
        floatBtn.className = 'feedback-float-btn';
        floatBtn.setAttribute('aria-label', '时光信箱 - 反馈建议');
        floatBtn.innerHTML = `
            <i class="fas fa-envelope"></i>
            <span class="btn-tooltip">时光信箱</span>
        `;
        floatBtn.onclick = openFeedbackModal;
        document.body.appendChild(floatBtn);
        
        const modalHtml = `
            <div class="feedback-modal-overlay" id="feedbackModal">
                <div class="feedback-modal">
                    <div class="feedback-header">
                        <h3><i class="fas fa-envelope-open-text"></i> 时光信箱</h3>
                        <button class="feedback-close" onclick="closeFeedbackModal()">&times;</button>
                    </div>
                    <div class="feedback-body" id="feedbackBody">
                        ${getFeedbackFormHTML()}
                    </div>
                    <div class="feedback-footer">
                        <p>每一条反馈都会认真阅读 <i class="fas fa-heart"></i></p>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstElementChild);
        
        const modal = document.getElementById('feedbackModal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeFeedbackModal();
                }
            });
        }
        
        console.log('[feedback] 时光信箱初始化完成', WEBHOOK_URL ? '(Webhook模式)' : '(邮件模式)');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFeedback);
    } else {
        initFeedback();
    }
})();
