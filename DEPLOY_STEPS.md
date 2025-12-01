# 部署步骤 - 修复 CORS 登录错误

## 问题说明

前端（hi-ultra.com）请求后端 API（cosmetic-ve-server.vercel.app）时出现 CORS 跨域错误。

## 已完成的修改

✅ 前端 API 配置改为相对路径 `/api`（避免跨域）
✅ 后端增强 CORS 处理（显式处理 OPTIONS 预检）
✅ Vercel 配置支持单项目全栈部署
✅ 修复 Node 版本兼容性

## 部署命令

### 1. 提交代码

```bash
git add .
git commit -m "fix: 修复 CORS 登录错误，统一部署架构

- 前端 API 使用相对路径 /api
- 后端增强 CORS OPTIONS 预检处理
- 统一前后端部署在同一域名
- 删除冲突的 server/vercel.json"

git push
```

### 2. Vercel 项目配置

⚠️ **重要：确保只有一个 Vercel 项目**

登录 Vercel Dashboard：

1. **检查现有项目**：
   - 如果有 `cosmetic-ve-server` 项目 → **删除它**
   - 保留主项目（连接到 GitHub 仓库）

2. **配置主项目**：
   - Settings → Domains → 绑定 `hi-ultra.com`
   - Settings → Environment Variables → 设置环境变量：
     ```
     DATABASE_URL=postgresql://...
     JWT_SECRET=your-secret-key
     NODE_ENV=production
     ```

3. **触发重新部署**：
   - Deployments → 点击最新部署 → "Redeploy"
   - 或直接推送代码会自动部署

### 3. 验证部署

等待部署完成后（约 2-3 分钟），测试：

```bash
# 健康检查
curl https://hi-ultra.com/health

# API 可用性
curl https://hi-ultra.com/api/products
```

浏览器测试：

1. 打开 `https://hi-ultra.com/admin/login`
2. 输入管理员账号密码
3. 点击登录
4. ✅ 应该成功登录，不再出现 CORS 错误

## 故障排查

### 如果仍然出现 CORS 错误

**检查前端是否使用了新的 API 地址**：

1. 打开浏览器开发者工具（F12）
2. Network 标签
3. 尝试登录
4. 查看请求的 URL：
   - ✅ 正确：`https://hi-ultra.com/api/auth/login`
   - ❌ 错误：`https://cosmetic-ve-server.vercel.app/api/auth/login`

**如果还是旧地址**：

- 清除浏览器缓存
- 在 Vercel Dashboard 清除构建缓存重新部署

### 如果登录请求返回 404

**原因**：路由配置未生效

**检查**：

```bash
# 确认 vercel.json 只在根目录
ls -la vercel.json apps/server/vercel.json

# 应该只有根目录的存在
```

### 查看实时日志

Vercel Dashboard → 项目 → Functions → 查看日志：

- 应该看到 "🔍 CORS检查" 日志
- 应该看到 "✅ 白名单匹配成功"

## 架构对比

### ❌ 之前（跨域）

```
前端: hi-ultra.com
后端: cosmetic-ve-server.vercel.app
→ 跨域请求导致 CORS 错误
```

### ✅ 现在（同域）

```
统一域名: hi-ultra.com
  ├── /* → 前端静态文件
  └── /api/* → 后端 Serverless 函数
→ 同域请求，无 CORS 问题
```

## 需要的环境变量

在 Vercel 项目设置中配置（参考 `apps/server/ENV_VARIABLES_VERCEL.md`）：

| 变量名         | 说明                  | 示例                             |
| -------------- | --------------------- | -------------------------------- |
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host/db` |
| `JWT_SECRET`   | JWT 签名密钥          | 随机生成的安全字符串             |
| `NODE_ENV`     | 环境标识              | `production`                     |
| `CORS_ORIGINS` | CORS 白名单（可选）   | `https://hi-ultra.com`           |

## 预期结果

部署成功后：

- ✅ 前端可正常访问：`https://hi-ultra.com`
- ✅ API 健康检查通过：`https://hi-ultra.com/health`
- ✅ 登录功能正常，无 CORS 错误
- ✅ 管理后台可以正常使用

## 时间预估

- 提交代码：1 分钟
- Vercel 部署：2-3 分钟
- 验证测试：1 分钟

**总计：约 5 分钟**
