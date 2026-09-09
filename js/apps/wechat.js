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
        let prevSender = null; // 记录上一条消息是谁发的

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
            
            // 🌟 核心：判断是否是同一个人连续发消息
            const isConsecutive = (item.sender === prevSender);

            let finalContent = item.content;
            if (window.marked) {
                finalContent = window.marked.parse(item.content);
            }

            html += `
                <div class="chat-msg ${isMe ? 'right' : 'left'} ${isConsecutive ? 'consecutive' : ''}">
                    <!-- 如果是连发，就不显示头像，用一个透明的占位符代替，保证气泡对齐 -->
                    ${isConsecutive ? '<div class="chat-avatar-placeholder"></div>' : `<img class="chat-avatar" src="${isMe ? avatarMe : avatarOther}" />`}
                    <div class="chat-content-box">
                        <div class="chat-bubble markdown-body" onclick="window.PhoneEngine.openMsgMenu(${index}, '${item.sender}')">${finalContent}</div>
                        <div class="chat-time">${item.time} ${isMe ? '· 已读' : ''}</div>
                    </div>
                </div>
            `;
            
            // 更新上一条消息的发送人
            prevSender = item.sender;
        });
        html += '</div>';
        return html;
    }
};
