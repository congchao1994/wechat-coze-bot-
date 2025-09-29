# WeChat Work + Coze AI Bot

基于Vercel的企业微信智能机器人中间件服务。

## 🚀 功能特性

- ✅ 接收企业微信消息
- 🤖 调用Coze AI智能体
- 📤 自动回复到企业微信
- 🌐 部署在Vercel免费平台
- 📊 完整的日志记录

## 🔧 环境变量配置

在Vercel控制台配置以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `COZE_API_TOKEN` | Coze API令牌 | `pat_xxxxxxxxxx` |
| `COZE_BOT_ID` | Coze机器人ID | `7xxxxxxxxxx` |
| `JUHE_APP_KEY` | 聚合聊天App Key | `xxxxxxxxxx` |
| `JUHE_APP_SECRET` | 聚合聊天App Secret | `xxxxxxxxxx` |
| `INSTANCE_GUID` | 企业微信实例GUID | `xxxxxxxxxx` |

## 📡 接口说明

### POST /api/webhook
接收企业微信消息的主要接口

**请求示例:**
```json
{
    "msg_type": "text",
    "content": "你好",
    "conversation_id": "S:788xxxxx",
    "from_user_id": "168xxxxx",
    "timestamp": 1640995200
}
```

**响应示例:**
```json
{
    "status": "success",
    "message": "Message processed successfully",
    "ai_response": "您好！我是AI助手..."
}
```

### GET /api/health
健康检查接口

**响应示例:**
```json
{
    "status": "ok",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "service": "WeChat-Coze Bot",
    "version": "1.0.0"
}
```

## 🚀 部署步骤

1. **克隆或下载项目**
2. **安装依赖**
   ```bash
   npm install
   ```
3. **部署到Vercel**
   ```bash
   vercel --prod
   ```
4. **配置环境变量**
5. **设置企业微信回调地址**

## 🔍 测试

### 本地测试
```bash
# 安装依赖
npm install

# 运行本地开发服务器（如果有的话）
npm run dev
```

### 生产测试
访问部署后的URL进行测试：
- 健康检查: `https://your-app.vercel.app/api/health`
- Webhook测试: `POST https://your-app.vercel.app/api/webhook`

## 📊 监控

在Vercel控制台可以查看：
- 函数调用次数
- 执行时间
- 错误日志
- 流量统计

## 🐛 故障排除

### 1. 配置检查
访问 webhook 接口并发送健康检查请求：
```json
{
    "type": "health_check"
}
```

### 2. 日志查看
在Vercel控制台 > Functions 标签页查看实时日志

### 3. 常见错误
- `Configuration incomplete`: 检查环境变量
- `Method not allowed`: 确保使用POST请求
- `Timeout`: 检查网络连接和API响应时间

## 📚 相关文档

- [Vercel部署文档](https://vercel.com/docs)
- [Coze API文档](https://coze.cn/docs)
- [聚合聊天API文档](https://wework.apifox.cn)

## 📝 更新日志

### v1.0.0 (2024-01-01)
- ✅ 基础功能实现
- ✅ Vercel部署支持
- ✅ 完整的错误处理
- ✅ 日志记录功能
