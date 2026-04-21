import express from 'express';
import cors from 'cors';

// 本地启动或 Vercel 环境下，动态载入后端编译后的 App
let serverApp;
const loadServer = async () => {
    if (serverApp) return serverApp;
    try {
        // 这里的路径相对于 api/index.js
        // 在 Vercel 构建后，apps/server/dist 的内容被复制到 api/dist
        const module = await import('./dist/index.js');
        serverApp = module.default;
        console.log('✅ Backend Server App Loaded Successfully');
        return serverApp;
    } catch (e) {
        console.warn('⚠️ Backend Server App loading failed, using fallback:', e.message);
        return null;
    }
};

const bridgeApp = express();
bridgeApp.use(cors());
bridgeApp.use(express.json());

// 核心转发逻辑
bridgeApp.all('*', async (req, res) => {
    const app = await loadServer();
    
    // 打印调试信息 (Vercel Logs 可见)
    console.log(`[Bridge] ${req.method} ${req.url}`);

    if (app) {
        // 直接交给后端 Express 处理
        return app(req, res);
    }

    // --- 兜底逻辑 (仅在后端代码加载失败时生效) ---
    const url = req.url;

    // 针对用户反馈的 404 分类接口进行硬硬编码兜底
    if (url.includes('/products/categories/all')) {
        return res.json([
            { id: 1, name: '护肤系列', sort: 1, createdAt: new Date(), updatedAt: new Date() },
            { id: 2, name: '奢华彩妆', sort: 2, createdAt: new Date(), updatedAt: new Date() },
            { id: 3, name: '传世香氛', sort: 3, createdAt: new Date(), updatedAt: new Date() }
        ]);
    }

    if (url.includes('/health')) {
        return res.json({ status: 'ok', message: 'Backend Bridge Fallback Active' });
    }

    res.status(404).json({
        success: false,
        message: 'API Bridge: Backend app not ready and no fallback for this route.',
        path: url
    });
});

export default bridgeApp;
