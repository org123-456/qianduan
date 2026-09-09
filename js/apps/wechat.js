export const WechatApp = {
    id: 'wechat',
    name: '微信',
    icon: '💬',
    prompt: `生成3条最新的微信聊天记录。要求：必须符合角色当前状态，参考近期聊天。
返回JSON格式：{"items": [{"title": "聊天对象", "desc": "最后一条消息", "time": "HH:mm"}]}`,
    getCount: (data) => data?.items?.length || 0,
    renderList: (data) => {
        if (!data || !data.items) return '<div style="text-align:center;color:#999;margin-top:20px;">暂无聊天记录</div>';
        return data.items.map(item => `
            <div class="list-item">
                <div style="display:flex; justify-content:space-between;">
                    <b style="font-size:16px;">${item.title}</b> 
                    <span class="time">${item.time}</span>
                </div>
                <div style="color:#666; margin-top:8px; font-size:14px;">${item.desc}</div>
            </div>
        `).join('');
    }
};

