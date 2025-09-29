export default function handler(req, res) {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'WeChat-Coze Bot',
        version: '1.0.0',
        environment: {
            node_version: process.version,
            platform: process.platform
        }
    });
}
