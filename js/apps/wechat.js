export const WechatApp = {
    id: 'wechat',
    name: 'Chat',
    icon: '<i class="ph-fill ph-chat-circle-dots"></i>',
    hideInDesktop: true,
    prompt: ``,
    getCount: (data) => data?.items?.length || 0,
    renderList: (data) => {
        if (!data || !data.items || data.items.length === 0) {
            return '<div style="text-align:center;color:#999;margin-top:50px;">暂无聊天记录，快在底部打字和 TA 聊天吧！</div>';
        }
        
        const defaultMe = 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
        const defaultTa = 'https://api.dicebear.com/7.x/notionists/svg?seed=You&backgroundColor=dbe9f6';
        
        const avatarMe = localStorage.getItem('my_avatar') || defaultMe;
        const avatarOther = localStorage.getItem('ta_avatar') || defaultTa;

        let html = '<div class="chat-container">';
        let prevSender = null; 

        data.items.forEach((item, index) => {
            if (item.sender === 'typing') {
                html += `
                    <div class="chat-msg left">
                        <img class="chat-avatar" src="${avatarOther}" />
                        <div class="chat-content-box">
                            <div class="chat-bubble">
                                <div class="typing-indicator">
                                    <div class="typing-dot"></div>
                                    <div class="typing-dot"></div>
                                    <div class="typing-dot"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                prevSender = 'typing';
                return;
            }

            const isMe = item.sender === 'me';
            const isConsecutive = (item.sender === prevSender);

            let finalContent = item.content;
            if (window.marked) {
                finalContent = window.marked.parse(item.content);
            }

            // 🌟 核心：给对方的头像加上 onclick 事件，点击触发读心术！
            let avatarHtml = '';
            if (isConsecutive) {
                avatarHtml = '<div class="chat-avatar-placeholder"></div>';
            } else {
                if (isMe) {
                    avatarHtml = `<img class="chat-avatar" src="${avatarMe}" />`;
                } else {
                    avatarHtml = `<img class="chat-avatar" src="${avatarOther}" onclick="window.PhoneUI.showThought(${index})" style="cursor: pointer;" />`;
                }
            }

            html += `
                <div class="chat-msg ${isMe ? 'right' : 'left'} ${isConsecutive ? 'consecutive' : ''}">
                    ${avatarHtml}
                    <div class="chat-content-box">
                        <div class="chat-bubble markdown-body" onclick="window.PhoneEngine.openMsgMenu(${index}, '${item.sender}')">${finalContent}</div>
                        <div class="chat-time">${item.time} ${isMe ? '· 已读' : ''}</div>
                    </div>
                </div>
            `;
            
            prevSender = item.sender;
        });
        html += '</div>';
        return html;
    }
};
