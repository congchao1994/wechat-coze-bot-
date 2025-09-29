const axios = require('axios');

// 配置信息 - 将通过环境变量注入
const CONFIG = {
    COZE_API_TOKEN: process.env.COZE_API_TOKEN,
    COZE_BOT_ID: process.env.COZE_BOT_ID,
    JUHE_APP_KEY: process.env.JUHE_APP_KEY,
    JUHE_APP_SECRET: process.env.JUHE_APP_SECRET,
    JUHE_API_BASE: 'https://chat-api.juhebot.com/open/GuidRequest',
    INSTANCE_GUID: process.env.INSTANCE_GUID
};

export default async function handler(req, res) {
    // 设置CORS头（如果需要）
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 只接受POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: '只接受POST请求'
        });
    }

    try {
        const message = req.body;
        console.log('收到消息:', JSON.stringify(message, null, 2));

        // 健康检查
        if (req.url === '/health' || message.type === 'health_check') {
            return res.status(200).json({ 
                status: 'ok', 
                timestamp: new Date().toISOString(),
                config: {
                    coze_configured: !!CONFIG.COZE_API_TOKEN,
                    juhe_configured: !!CONFIG.JUHE_APP_KEY
                }
            });
        }

        // 检查配置
        if (!CONFIG.COZE_API_TOKEN || !CONFIG.COZE_BOT_ID || !CONFIG.JUHE_APP_KEY) {
            console.error('配置不完整');
            return res.status(500).json({ 
                error: 'Configuration incomplete',
                message: '请检查环境变量配置',
                missing: {
                    coze_token: !CONFIG.COZE_API_TOKEN,
                    coze_bot_id: !CONFIG.COZE_BOT_ID,
                    juhe_key: !CONFIG.JUHE_APP_KEY,
                    juhe_secret: !CONFIG.JUHE_APP_SECRET,
                    instance_guid: !CONFIG.INSTANCE_GUID
                }
            });
        }

        // 处理文本消息
        if (message.msg_type === 'text' && message.content) {
            const userMessage = message.content;
            const conversationId = message.conversation_id;

            console.log(`处理消息: "${userMessage}" from ${conversationId}`);

            // 调用Coze AI
            const aiResponse = await callCozeAPI(userMessage);
            console.log(`AI回复: "${aiResponse}"`);

            // 发送回复到企业微信
            await sendWeChatWorkMessage(conversationId, aiResponse);

            return res.status(200).json({ 
                status: 'success',
                message: 'Message processed successfully',
                ai_response: aiResponse
            });
        }

        // 其他消息类型暂时忽略
        console.log('忽略非文本消息:', message.msg_type);
        return res.status(200).json({ 
            status: 'ignored',
            message: '非文本消息已忽略'
        });

    } catch (error) {
        console.error('处理消息错误:', error);
        return res.status(500).json({ 
            status: 'error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

// 调用Coze API
async function callCozeAPI(message) {
    try {
        console.log(`调用Coze API: "${message}"`);

        const response = await axios.post('https://api.coze.cn/open_api/v2/chat', {
            conversation_id: generateConversationId(),
            bot_id: CONFIG.COZE_BOT_ID,
            user: 'wework_user',
            query: message,
            chat_history: [],
            stream: false
        }, {
            headers: {
                'Authorization': `Bearer ${CONFIG.COZE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 25000 // Vercel函数30秒限制，留5秒缓冲
        });

        console.log('Coze API响应状态:', response.status);
        console.log('Coze API响应数据:', JSON.stringify(response.data, null, 2));

        // 提取AI回复
        const messages = response.data.messages || [];
        const aiReply = messages.find(msg => msg.type === 'answer');
        
        if (aiReply && aiReply.content) {
            return aiReply.content;
        } else {
            console.warn('未找到answer类型的消息:', messages);
            return '抱歉，我暂时无法回答这个问题。';
        }

    } catch (error) {
        console.error('调用Coze API失败:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        
        if (error.response?.status === 401) {
            return '抱歉，AI服务认证失败，请检查配置。';
        } else if (error.response?.status === 429) {
            return '抱歉，请求过于频繁，请稍后再试。';
        } else {
            return '抱歉，AI服务暂时不可用，请稍后再试。';
        }
    }
}

// 发送消息到企业微信
async function sendWeChatWorkMessage(conversationId, content) {
    try {
        console.log(`发送消息到企微: "${content}" -> ${conversationId}`);

        const response = await axios.post(CONFIG.JUHE_API_BASE, {
            app_key: CONFIG.JUHE_APP_KEY,
            app_secret: CONFIG.JUHE_APP_SECRET,
            path: '/msg/send_text',
            data: {
                guid: CONFIG.INSTANCE_GUID,
                conversation_id: conversationId,
                content: content
            }
        }, {
            timeout: 10000
        });

        console.log('企微消息发送结果:', response.data);

        if (response.data.code !== 0) {
            throw new Error(`发送失败: ${response.data.message}`);
        }

    } catch (error) {
        console.error('发送消息到企微失败:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw error;
    }
}

// 生成会话ID
function generateConversationId() {
    return `vercel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
