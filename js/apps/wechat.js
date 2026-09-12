export const WechatApp = {
    renderList(data) {
        if (!data || !data.items || data.items.length === 0) {
            return `<div style="text-align:center; padding:50px 0; color:var(--text-sub); font-size:13px;">暂无聊天记录，向TA打个招呼吧~</div>`;
        }

        const roleId = window.Config.currentContactId;
        const totalItems = window.Config.phoneData[roleId]?.wechat?.items || [];
        const totalLen = totalItems.length;

        // 如果总数超过 50，截取最后 50 条渲染
        const renderItems = totalLen > 50 ? totalItems.slice(-50) : totalItems;
        const offset = totalLen > 50 ? totalLen - 50 : 0;

        const myAvatar = localStorage.getItem('my_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=You&backgroundColor=dbe9f6';

        let html = '<div class="chat-container">';
        
        renderItems.forEach((item, idx) => {
            // 🌟 核心修复：算出这条消息在真实总数据库里的真实下标！
            const realIndex = offset + idx;

            if (item.sender === 'typing') {
                html += `
                    <div class="chat-msg left">
                        <img src="${taAvatar}" class="chat-avatar">
                        <div class="chat-content-box">
                            <div class="chat-bubble">
                                <div class="typing-indicator">
                                    <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }

            const isMe = item.sender === 'me';
            const avatar = isMe ? myAvatar : taAvatar;
            const sideClass = isMe ? 'right' : 'left';

            // 判断是否为同一人连发
            const prevItem = idx > 0 ? renderItems[idx - 1] : null;
            const isConsecutive = prevItem && prevItem.sender === item.sender && prevItem.sender !== 'typing';
            const consecutiveClass = isConsecutive ? 'consecutive' : '';

            let contentHtml = item.content;
            if (window.marked) {
                contentHtml = window.marked.parse(item.content);
            }

            // 头像点击绑定真实索引！
            const avatarHtml = isMe 
                ? (isConsecutive ? '<div class="chat-avatar-placeholder"></div>' : `<img src="${avatar}" class="chat-avatar">`)
                : (isConsecutive ? '<div class="chat-avatar-placeholder"></div>' : `<img src="${avatar}" class="chat-avatar" onclick="window.PhoneUI.showThought(${realIndex}, 'wechat')">`);

            html += `
                <div class="chat-msg ${sideClass} ${consecutiveClass}">
                    ${avatarHtml}
                    <div class="chat-content-box">
                        <div class="chat-bubble markdown-body" onclick="window.PhoneEngine.openMsgMenu(${realIndex}, '${item.sender}')">
                            ${contentHtml}
                        </div>
                        <div class="chat-time">${item.time || ''}</div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }
};
