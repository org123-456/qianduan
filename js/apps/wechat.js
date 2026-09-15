export const WechatApp = {
    renderList(data) {
        if (!data || !data.items || data.items.length === 0) {
            return `<div style="text-align:center; padding:50px 0; color:var(--text-sub); font-size:13px;">暂无聊天记录，向TA打个招呼吧~</div>`;
        }

        const roleId = window.Config.currentContactId;
        const totalItems = window.Config.phoneData[roleId]?.wechat?.items || [];
        const totalLen = totalItems.length;

        // 最多显示最后 50 条
        const renderItems = totalLen > 50 ? totalItems.slice(-50) : totalItems;
        const offset = totalLen > 50 ? totalLen - 50 : 0;

        const myAvatar = localStorage.getItem('my_avatar') ||
            'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';

        const taAvatar = localStorage.getItem('ta_avatar') ||
            'https://api.dicebear.com/7.x/notionists/svg?seed=You&backgroundColor=dbe9f6';

        let html = '<div class="chat-container">';

        renderItems.forEach((item, idx) => {

            // 这条消息在完整数据库中的真实下标
            const realIndex = offset + idx;

            // 正在输入
            if (item.sender === 'typing') {
                html += `
                    <div class="chat-msg left">
                        <img src="${taAvatar}" class="chat-avatar">
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
            const avatar = isMe ? myAvatar : taAvatar;
            const sideClass = isMe ? 'right' : 'left';

            // 判断是不是同一个人连续发消息
            const prevItem = idx > 0 ? renderItems[idx - 1] : null;

            const isConsecutive =
                prevItem &&
                prevItem.sender === item.sender &&
                prevItem.sender !== 'typing';

            const consecutiveClass = isConsecutive ? 'consecutive' : '';

            // Markdown
            let contentHtml = item.content || '';

            if (window.marked) {
                contentHtml = window.marked.parse(contentHtml);
            }

            /*
             * 重点：
             * realIndex 已经是真实数据库下标，
             * 不要再让 showThought() 二次计算。
             *
             * 同时给连续消息也提供心声入口：
             * - 第一条：头像可点击
             * - 后续连续消息：左侧 placeholder 也可以点击
             */

            let avatarHtml = '';

            if (isMe) {

                // 我自己的消息不显示心声
                avatarHtml = isConsecutive
                    ? '<div class="chat-avatar-placeholder"></div>'
                    : `<img src="${avatar}" class="chat-avatar">`;

            } else {

                if (isConsecutive) {

                    // 连续消息也可以点心声
                    avatarHtml = `
                        <div
                            class="chat-avatar-placeholder thought-click-target"
                            onclick="window.PhoneUI.showThought(${realIndex}, 'wechat')"
                            title="查看TA的心声"
                            style="cursor:pointer;"
                        ></div>
                    `;

                } else {

                    avatarHtml = `
                        <img
                            src="${avatar}"
                            class="chat-avatar"
                            onclick="window.PhoneUI.showThought(${realIndex}, 'wechat')"
                            title="查看TA的心声"
                            style="cursor:pointer;"
                        >
                    `;
                }
            }

            html += `
                <div class="chat-msg ${sideClass} ${consecutiveClass}">

                    ${avatarHtml}

                    <div class="chat-content-box">

                        <div
                            class="chat-bubble markdown-body"
                            onclick="window.PhoneEngine.openMsgMenu(${realIndex}, '${item.sender}')"
                        >
                            ${contentHtml}
                        </div>

                        <div class="chat-time">
                            ${item.time || ''}
                        </div>

                    </div>
                </div>
            `;
        });

        html += '</div>';

        return html;
    }
};
