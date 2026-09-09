export const WechatApp = {
    id: 'wechat',
    name: 'Chat',
    icon: '<i class="ph-fill ph-chat-circle-dots"></i>',
    hideInDesktop: true,
    prompt: `生成4条最新的情侣聊天记录。要求：必须符合角色当前状态，参考近期聊天，有来有回。
返回JSON格式：{"items": [{"sender": "other", "content": "对方说的话", "time": "10:00"}, {"sender": "me", "content": "我回复的话", "time": "10:02"}]}`,
    getCount: (data) => data?.items?.length || 0,
    renderList: (data) => {
        if (!data || !data.items || data.items.length === 0) {
            return '<div style="text-align:center;color:#999;margin-top:50px;">暂无聊天记录，快在底部打字和 TA 聊天吧！</div>';
        }
        
        // 优先读取你自定义的头像，如果没有，就用默认的
        const defaultMe = 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
        const defaultTa = 'https://api.dicebear.com/7.x/notionists/svg?seed=You&backgroundColor=dbe9f6';
        
        const avatarMe = localStorage.getItem('my_avatar') || defaultMe;
        const avatarOther = localStorage.getItem('ta_avatar') || defaultTa;

        let html = '<div class="chat-container">';
        data.items.forEach(item => {
            const isMe = item.sender === 'me';
            html += `
                <div class="chat-msg ${isMe ? 'right' : 'left'}">
                    <img class="chat-avatar" src="${isMe ? avatarMe : avatarOther}" />
                    <div class="chat-content-box">
                        <div class="chat-bubble">${item.content}</div>
                        <div class="chat-time">${item.time} ${isMe ? '· 已读' : ''}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }
};
