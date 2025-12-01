# 🔧 Vercel 后端环境变量配置

## 📋 在Vercel Dashboard中配置这些环境变量

访问路径: **Project → Settings → Environment Variables**

---

## 必需环境变量

### 1. DATABASE_URL

**描述**: PostgreSQL数据库连接字符串
**示例值**:

```
postgresql://username:password@host.region.neon.tech:5432/databasename?sslmode=require
```

**获取方式**:

- Neon: 复制 Connection String
- Supabase: Settings → Database → Connection String → URI
- Vercel Postgres: 自动提供

**环境**: Production, Preview (可选), Development (可选)

---

### 2. JWT_SECRET

**描述**: JWT令牌加密密钥
**示例值**:

```
a8f3k2m9n7b6v4c1x5z8q2w7e4r9t6y3u1i0o5p8
```

**生成方式**:

```bash
# 在PowerShell中生成随机密钥
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

**环境**: Production, Preview, Development

⚠️ **重要**: 生产环境必须使用强随机密钥，长度至少32位

---

### 3. NODE_ENV

**描述**: 运行环境标识
**值**:

```
production
```

**环境**: Production

---

## 可选环境变量

### 4. JWT_EXPIRES_IN

**描述**: JWT令牌过期时间
**默认值**: `7d`
**示例值**:

```
7d
```

或

```
24h
```

**环境**: Production (可选)

---

### 5. REFRESH_TOKEN_EXPIRES_IN

**描述**: 刷新令牌过期时间
**默认值**: `30d`
**示例值**:

```
30d
```

**环境**: Production (可选)

---

### 6. CORS_ORIGINS

**描述**: 额外的CORS允许源（逗号分隔）
**示例值**:

```
https://admin.hi-ultra.com,https://mobile.hi-ultra.com
```

**环境**: Production (如需要)

⚠️ 注意: 已内置支持以下域名，无需配置:

- `https://hi-ultra.com`
- `https://www.hi-ultra.com`
- `https://cosmetic-ve.vercel.app`
- 所有 `*.vercel.app` 域名

---

## 🖥️ Vercel Dashboard 配置步骤

### 方式1: 在网页界面配置

1. 登录 Vercel Dashboard
2. 选择后端项目 (cosmetic-ve-server)
3. 点击 **Settings** 标签
4. 左侧选择 **Environment Variables**
5. 点击 **Add New** 按钮
6. 逐个添加上述环境变量:
   - Name: 输入变量名 (例如 `DATABASE_URL`)
   - Value: 输入变量值
   - Environment: 选择 `Production`
7. 点击 **Save**
8. 重复步骤5-7，添加所有环境变量

### 方式2: 使用 Vercel CLI

```bash
# 安装 Vercel CLI (如果未安装)
npm i -g vercel

# 登录
vercel login

# 切换到后端目录
cd apps/server

# 添加环境变量
vercel env add DATABASE_URL production
# 粘贴值后按回车

vercel env add JWT_SECRET production
# 粘贴值后按回车

vercel env add NODE_ENV production
# 输入: production

# 查看已配置的环境变量
vercel env ls
```

---

## ✅ 配置完成后

### 1. 重新部署

配置环境变量后，需要重新部署才能生效:

**在Dashboard中**:

1. 进入项目
2. 点击 **Deployments** 标签
3. 找到最新的部署
4. 点击右侧的 **...** 菜单
5. 选择 **Redeploy**
6. 勾选 **Use existing Build Cache**
7. 点击 **Redeploy**

**使用CLI**:

```bash
cd apps/server
vercel --prod
```

### 2. 验证部署

等待部署完成后，测试API:

```bash
# PowerShell
Invoke-WebRequest -Uri "https://你的后端地址/health"
Invoke-WebRequest -Uri "https://你的后端地址/api/test"
```

应该返回JSON响应，不再是 FUNCTION_INVOCATION_FAILED。

---

## 🔍 常见问题

### Q1: 配置了DATABASE_URL后仍然报错？

**检查**:

1. 数据库URL格式是否正确
2. 数据库是否允许外部连接
3. 是否需要 `?sslmode=require` 参数
4. 用户名密码中的特殊字符是否正确编码

**示例正确格式**:

```
postgresql://user:pass@host:5432/db?sslmode=require
```

### Q2: 如何生成安全的JWT_SECRET？

**在线生成**:
访问 https://randomkeygen.com/ 选择 "CodeIgniter Encryption Keys"

**本地生成** (PowerShell):

```powershell
# 生成40位随机字符串
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

**本地生成** (Node.js):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Q3: 环境变量修改后没有生效？

**解决**:

1. 保存环境变量后必须重新部署
2. 不要使用 "Instant Rollback"，要用 "Redeploy"
3. 清除浏览器缓存
4. 等待几分钟让CDN更新

### Q4: 如何查看环境变量是否配置成功？

访问诊断端点:

```
https://你的后端地址/api/diagnostic
```

会显示环境变量配置状态（不会泄露实际值）。

---

## 📊 配置清单

使用这个清单确认所有必需的环境变量都已配置:

- [ ] DATABASE_URL - PostgreSQL连接字符串
- [ ] JWT_SECRET - 随机密钥 (32位以上)
- [ ] NODE_ENV - 设置为 "production"
- [ ] 已保存所有环境变量
- [ ] 已重新部署应用
- [ ] 已验证 /health 端点正常
- [ ] 已验证 /api/test 端点正常
- [ ] 已验证 /api/diagnostic 显示环境变量已配置

---

**最后更新**: 2024-11-28
**适用项目**: cosmetic-ve (后端)
