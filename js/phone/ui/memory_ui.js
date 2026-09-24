export const MemoryUI = {
    // 🌟 修复：保留原有的 initStarrySea，但只负责生成星星，不直接显示气泡
    initStarrySea() {
        const bg = document.getElementById('starry-sea-bg');
        if (!bg) return;
        
        if (bg.children.length === 0) {
            for (let i = 0; i < 50; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                const size = Math.random() * 3 + 1;
                star.style.width = size + 'px';
                star.style.height = size + 'px';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDuration = (Math.random() * 3 + 2) + 's';
                star.style.animationDelay = (Math.random() * 2) + 's';
                bg.appendChild(star);
            }
        }
        this.renderMemoryFragments();
    },

    // 🌟 新增：潜入星海动画
    enterStarrySea() {
        const cover = document.getElementById('memory-cover-view');
        const inside = document.getElementById('memory-inside-view');
        const bubbles = document.getElementById('floating-bubbles');
        
        if (cover && inside && bubbles) {
            cover.classList.add('dive-in'); // 相框放大透明
            inside.classList.add('active'); // 星空浮现
            
            // 延迟一点点让气泡有果冻弹出的感觉
            setTimeout(() => {
                bubbles.classList.add('show');
            }, 300);
        }
    },

    // 🌟 新增：退出星海动画
    exitStarrySea() {
        const cover = document.getElementById('memory-cover-view');
        const inside = document.getElementById('memory-inside-view');
        const bubbles = document.getElementById('floating-bubbles');
        
        if (cover && inside && bubbles) {
            bubbles.classList.remove('show');
            inside.classList.remove('active');
            cover.classList.remove('dive-in');
        }
    },

    renderMemoryFragments() {
        const container = document.getElementById('memory-fragments-container');
        if (!container || !window.PhoneAPI || !window.PhoneAPI.EchoVault) return;
        container.innerHTML = '';
        const evData = window.PhoneAPI.EchoVault.getData();
        const dates = Object.keys(evData.daily);
        if (dates.length === 0) return;

        const maxFrags = Math.min(dates.length, 15);
        const shuffled = dates.sort(() => 0.5 - Math.random()).slice(0, maxFrags);

        shuffled.forEach(date => {
            const frag = document.createElement('div');
            frag.className = 'memory-fragment';
            frag.style.left = (Math.random() * 80 + 10) + '%';
            frag.style.top = (Math.random() * 80 + 10) + '%';
            frag.style.animationDelay = (Math.random() * 2) + 's';
            
            frag.onclick = () => {
                const item = evData.daily[date];
                const textEl = document.getElementById('blindbox-text');
                const metaEl = document.getElementById('blindbox-meta');
                if (textEl && metaEl) {
                    let content = item.content.replace(/---/g, '').trim();
                    if (content.length > 100) content = content.substring(0, 100) + '...';
                    textEl.innerText = `“${content}”`;
                    metaEl.innerText = `${date} · ${item.tags || '日常'}`;
                }
                const bg = document.getElementById('blindbox-bg');
                const modal = document.getElementById('blindbox-modal');
                if (bg) bg.classList.add('show');
                if (modal) modal.classList.add('show');
                window.PhoneAPI.EchoVault.incrementHits('daily', date);
            };
            container.appendChild(frag);
        });
    },

    closeBlindBox() {
        const bg = document.getElementById('blindbox-bg');
        const modal = document.getElementById('blindbox-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    remindEchoVault() {
        if (!window.PhoneAPI || !window.PhoneAPI.EchoVault) return;
        const item = window.PhoneAPI.EchoVault.remind();
        if (!item) { window.PhoneAPI.showToast("记忆库还是空的，快去创造回忆吧！"); return; }
        
        const textEl = document.getElementById('blindbox-text');
        const metaEl = document.getElementById('blindbox-meta');
        if (textEl && metaEl) {
            let content = item.meta.content.replace(/---/g, '').trim();
            if (content.length > 150) content = content.substring(0, 150) + '...';
            textEl.innerText = `“${content}”`;
            metaEl.innerText = `${item.date} · ${item.meta.tags || '日常'} (回忆度: ${item.score})`;
        }
        const bg = document.getElementById('blindbox-bg');
        const modal = document.getElementById('blindbox-modal');
        if (bg) bg.classList.add('show');
        if (modal) modal.classList.add('show');
    }
};
