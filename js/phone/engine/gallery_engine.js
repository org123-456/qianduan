import { Config } from '../phone_config.js';
import { PhoneAPI } from '../phone_api.js';
import { PhoneUI } from '../phone_ui.js';

export const GalleryEngine = {
    uploadFaceLock() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            PhoneAPI.showToast('🔒 正在提取面部特征...');
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width; let height = img.height; const MAX_SIZE = 512;
                    if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                    else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const base64Url = canvas.toDataURL('image/jpeg', 0.6);
                    localStorage.setItem('img_ref_base64', base64Url);
                    const previewEl = document.getElementById('face-lock-preview');
                    if (previewEl) previewEl.innerHTML = `<img src="${base64Url}" style="width:100%;height:100%;object-fit:cover;">`;
                    PhoneAPI.showToast('✅ 锁脸图已保存！生图时将自动应用。');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        };
        input.click();
    },

    clearFaceLock() {
        localStorage.removeItem('img_ref_base64');
        const previewEl = document.getElementById('face-lock-preview');
        if (previewEl) previewEl.innerHTML = '<i class="ph ph-plus" style="font-size: 24px; color: var(--text-sub);"></i>';
        PhoneAPI.showToast('🗑️ 锁脸图已清除！');
    },

    compressImage(base64Str) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width; let height = img.height; const MAX_SIZE = 1024;
                if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = 'data:image/png;base64,' + base64Str;
        });
    },

    async generateAiImage() {
        const prompt = await PhoneUI.showCustomPrompt('🎨 请输入画面描述：', '大侦探不死途穿着黑衬衫，在赛博朋克城市的霓虹灯下抽烟，二次元动漫风格');
        if (!prompt) return;
        try {
            const b64Json = await PhoneAPI.generateImageAPI(prompt);
            PhoneAPI.showToast('✨ 画作已生成，正在冲洗入册...');
            const finalB64 = await this.compressImage(b64Json);
            const roleId = Config?.currentContactId;
            if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
            if (!Config.phoneData[roleId].gallery) Config.phoneData[roleId].gallery = { items: [] };
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            Config.phoneData[roleId].gallery.items.push({ id: 'img_' + Date.now(), content: finalB64, date: dateStr });
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            PhoneUI.renderAppContent('gallery');
            PhoneAPI.showToast('📸 新照片已保存在回忆相册！');
        } catch (e) { alert(e.message); }
    },

    deleteGalleryImage(id) {
        if (!confirm('确定要销毁这张照片吗？')) return;
        const roleId = Config?.currentContactId;
        const items = Config?.phoneData?.[roleId]?.gallery?.items || [];
        Config.phoneData[roleId].gallery.items = items.filter(i => i.id !== id);
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        PhoneUI.renderAppContent('gallery');
        if (window.PhoneUI && window.PhoneUI.closeImageViewer) window.PhoneUI.closeImageViewer();
        PhoneAPI.showToast('🗑️ 照片已销毁');
    }
};
