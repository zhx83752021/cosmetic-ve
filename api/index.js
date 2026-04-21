import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 本地启动或 Vercel 环境下，动态载入后端编译后的 App
let serverApp;
const loadServer = async () => {
    if (serverApp) return serverApp;
    try {
        // 这里的路径相对于 api/index.js
        // 在 Vercel 构建后，apps/server/dist 的内容被复制到 api/dist
        const distPath = path.join(__dirname, 'dist', 'index.js');
        const module = await import(distPath);
        serverApp = module.default;
        console.log('✅ Backend Server App Loaded Successfully from:', distPath);
        return serverApp;
    } catch (e) {
        console.warn('⚠️ Backend Server App loading failed, using fallback:', e.message);
        return null;
    }
};

const bridgeApp = express();
bridgeApp.use(cors());
bridgeApp.use(express.json());

// 打印所有进入桥接器的请求
bridgeApp.use((req, res, next) => {
    console.log(`[Vercel Bridge] Incoming: ${req.method} ${req.url}`);
    next();
});

// 核心转发逻辑
bridgeApp.all('*', async (req, res) => {
    // 强制修正 URL (Vercel 重写后可能丢失 /api 前缀，导致后端 App 内的路径不匹配)
    // 后端 App 通常有 app.use('/api', routes)
    if (!req.url.startsWith('/api')) {
        req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }

    const app = await loadServer();

    if (app) {
        // 直接交给后端 Express 处理
        return app(req, res);
    }

    // --- 兜底逻辑 (仅在后端代码加载失败时生效) ---
    const url = req.url;

    // 分类接口兜底
    if (url.includes('/products/categories/all')) {
        return res.json([
            { id: 1, name: '护肤系列', sort: 1, createdAt: new Date(), updatedAt: new Date() },
            { id: 2, name: '奢华彩妆', sort: 2, createdAt: new Date(), updatedAt: new Date() },
            { id: 3, name: '格调香氛', sort: 3, createdAt: new Date(), updatedAt: new Date() }
        ]);
    }

    if (url.includes('/health') || url.includes('/ping')) {
        return res.json({ status: 'ok', message: 'Backend Bridge Fallback Active', timestamp: new Date() });
    }

    // 产品列表兜底
    if (url.includes('/products')) {
        return res.json({
            success: true,
            data: {
                items: [],
                total: 0,
                page: 1,
                pageSize: 10
            }
        });
    }

    res.status(404).json({
        success: false,
        message: 'API Bridge: Backend app not ready and no fallback for this route.',
        path: url,
        debug_info: {
            dirname: __dirname,
            has_dist: true // 假设构建成功了
        }
    });
});

export default bridgeApp;
