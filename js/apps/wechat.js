export const WechatApp = {
    id: 'wechat',
    name: 'Chat',
    icon: '<i class="ph-fill ph-chat-circle-dots"></i>', // 换成高级图标
    hideInDesktop: true,
    prompt: `生成4条最新的情侣聊天记录。要求：必须符合角色当前状态，参考近期聊天，有来有回。
返回JSON格式：{"items": [{"sender": "other", "content": "对方说的话", "time": "10:00"}, {"sender": "me", "content": "我回复的话", "time": "10:02"}]}`,
    getCount: (data) => data?.items?.length || 0,
    renderList: (data) => {
        if (!data || !data.items) return '<div style="text-align:center;color:#999;margin-top:50px;">暂无聊天记录，去 Mine 页面点一下“重新生成数据”吧</div>';
        
        const avatarMe = 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
        const avatarOther = 'https://api.dicebear.com/7.x/notionists/svg?seed=You&backgroundColor=dbe9f6';

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
