export const WalletApp = {
    id: 'wallet',
    name: '钱包',
    icon: '<i class="ph-fill ph-wallet"></i>', // 换成高级图标
    prompt: `生成3条今天的消费记录。要求：金额合理，消费地点/内容必须与角色的行程、其他App数据一致。
返回JSON格式：{"items": [{"title": "商户名称", "desc": "消费金额(如 -150.00)", "time": "HH:mm"}]}`,
    getCount: (data) => data?.items?.length || 0,
    renderList: (data) => {
        if (!data || !data.items) return '<div style="text-align:center;color:#999;margin-top:20px;">暂无消费记录</div>';
        return data.items.map(item => `
            <div class="list-item">
                <div style="display:flex; justify-content:space-between;">
                    <b style="font-size:16px;">${item.title}</b> 
                    <span style="color:#d9534f; font-weight:bold; font-size:16px;">${item.desc}</span>
                </div>
                <div class="time" style="margin-top:8px;">今天 ${item.time}</div>
            </div>
        `).join('');
    }
};
