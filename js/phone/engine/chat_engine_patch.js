import { ChatEngine } from './engine/chat_engine.js';

const originalSendChatMessage = ChatEngine.sendChatMessage.bind(ChatEngine);

ChatEngine.sendChatMessage = function sendChatMessage(isRegen = false) {
    // The form submit path may call sendUserMsgOnly() first, which clears the
    // input before sendChatMessage() runs. Recover that just-saved message so
    // the model does not receive the fallback "请继续" prompt.
    if (!isRegen) {
        const input = document.getElementById('chat-input');
        const roleId = ChatEngine && window.Config?.currentContactId;
        const items = window.Config?.phoneData?.[roleId]?.wechat?.items || [];
        const lastItem = items[items.length - 1];
        if (input && !input.value.trim() && lastItem?.sender === 'me' && lastItem.content) {
            items.pop();
            input.value = lastItem.content;
        }
    }

    return originalSendChatMessage(isRegen);
};

export { ChatEngine };
export default ChatEngine;
