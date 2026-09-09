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
        // 注意这里加了 index 索引
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
                return;
            }

            const isMe = item.sender === 'me';
            html += `
                <div class="chat-msg ${isMe ? 'right' : 'left'}">
                    <img class="chat-avatar" src="${isMe ? avatarMe : avatarOther}" />
                    <div class="chat-content-box">
                        <!-- 点击气泡，呼出操作菜单 -->
                        <div class="chat-bubble" onclick="window.PhoneEngine.openMsgMenu(${index}, '${item.sender}')">${item.content}</div>
                        <div class="chat-time">${item.time} ${isMe ? '· 已读' : ''}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }
};
