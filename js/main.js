/**
 * 全局逻辑：导航、过渡动画、UI 交互
 */

document.addEventListener('DOMContentLoaded', () => {
    // 初始动画
    gsap.from('.nav-bar', { y: -100, opacity: 0, duration: 1, ease: 'power3.out' });
    gsap.from('.sidebar', { x: 300, opacity: 0, duration: 1, delay: 0.5, ease: 'power3.out' });

    // 交互提示自动隐藏
    const hint = document.querySelector('.hint-system');
    if (hint) {
        setTimeout(() => {
            hint.style.opacity = '0';
        }, 5000);
    }

    // 处理导航链接点击（如果需要平滑过渡，可以拦截点击）
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });

    // 侧边栏自动展开逻辑已经在 CSS 中处理 (hover)，这里可以增加一些额外的 GSAP 动画
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.addEventListener('mouseenter', () => {
            gsap.to(sidebar, { boxShadow: '-20px 0 50px rgba(212, 175, 55, 0.2)', duration: 0.3 });
        });
        sidebar.addEventListener('mouseleave', () => {
            gsap.to(sidebar, { boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)', duration: 0.3 });
        });
    }
});

/**
 * 工具函数：格式化日期
 */
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * 设置当前日期为默认值
 */
function setDefaultDates(ids) {
    const today = formatDate(new Date());
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = today;
    });
}
