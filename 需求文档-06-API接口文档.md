# 化妆品官网与后台管理系统需求文档 (6/8)

## 🔌 API接口文档

### 1. 接口规范

#### 1.1 基本信息

**Base URL**: `https://api.example.com/v1`

**请求头**:
```http
Content-Type: application/json
Authorization: Bearer {token}
```

**响应格式**:
```typescript
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": 1704067200000
}

// 失败响应
{
  "code": 400,
  "message": "参数错误",
  "error": "详细错误信息",
  "timestamp": 1704067200000
}
```

**状态码规范**:
- 200: 成功
- 400: 参数错误
- 401: 未授权
- 403: 无权限
- 404: 资源不存在
- 500: 服务器错误

---

### 2. 用户相关接口

#### 2.1 用户注册
```http
POST /auth/register
```

**请求参数**:
```json
{
  "phone": "13800138000",
  "password": "123456",
  "code": "123456",
  "nickname": "用户昵称"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "userInfo": {
      "id": "uuid",
      "nickname": "用户昵称",
      "avatar": "https://...",
      "phone": "138****8000"
    }
  }
}
```

#### 2.2 用户登录
```http
POST /auth/login
```

**请求参数**:
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

#### 2.3 获取用户信息
```http
GET /user/profile
```

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "id": "uuid",
    "nickname": "用户昵称",
    "avatar": "https://...",
    "phone": "138****8000",
    "email": "user@example.com",
    "gender": "female",
    "birthday": "1990-01-01",
    "memberLevel": "gold",
    "points": 1234,
    "balance": 567.89
  }
}
```

#### 2.4 更新用户信息
```http
PUT /user/profile
```

**请求参数**:
```json
{
  "nickname": "新昵称",
  "avatar": "https://...",
  "gender": "female",
  "birthday": "1990-01-01"
}
```

#### 2.5 修改密码
```http
PUT /user/password
```

**请求参数**:
```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

---

### 3. 商品相关接口

#### 3.1 获取商品列表
```http
GET /products?page=1&limit=20&categoryId=xxx&keyword=xxx
```

**查询参数**:
- page: 页码 (默认1)
- limit: 每页数量 (默认20)
- categoryId: 分类ID
- keyword: 搜索关键词
- minPrice: 最低价格
- maxPrice: 最高价格
- sort: 排序方式 (sales/price_asc/price_desc/new)

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "uuid",
        "name": "商品名称",
        "subtitle": "副标题",
        "mainImage": "https://...",
        "originalPrice": 399.00,
        "sellingPrice": 299.00,
        "sales": 1234,
        "stock": 100,
        "tags": ["新品", "热卖"],
        "rating": 4.8,
        "reviewCount": 128
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

#### 3.2 获取商品详情
```http
GET /products/:id
```

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "id": "uuid",
    "name": "商品名称",
    "subtitle": "副标题",
    "category": {
      "id": "uuid",
      "name": "分类名称"
    },
    "brand": {
      "id": "uuid",
      "name": "品牌名称"
    },
    "mainImages": ["https://...", "https://..."],
    "videoUrl": "https://...",
    "originalPrice": 399.00,
    "sellingPrice": 299.00,
    "stock": 100,
    "sales": 1234,
    "description": "商品描述",
    "detailImages": ["https://...", "https://..."],
    "ingredients": "成分表",
    "usage": "使用方法",
    "efficacy": ["保湿", "美白"],
    "suitableFor": ["干性肌肤", "中性肌肤"],
    "shelfLife": "3年",
    "origin": "法国",
    "skus": [
      {
        "id": "uuid",
        "specValues": {
          "颜色": "自然色",
          "容量": "30ml"
        },
        "price": 299.00,
        "stock": 50,
        "image": "https://..."
      }
    ],
    "rating": 4.8,
    "reviewCount": 128
  }
}
```

#### 3.3 获取商品评价
```http
GET /products/:id/reviews?page=1&limit=10&rating=5&hasImage=true
```

**查询参数**:
- page: 页码
- limit: 每页数量
- rating: 评分筛选 (1-5)
- hasImage: 是否有图

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "statistics": {
      "totalCount": 128,
      "avgRating": 4.8,
      "ratingDistribution": {
        "5": 100,
        "4": 20,
        "3": 5,
        "2": 2,
        "1": 1
      }
    },
    "list": [
      {
        "id": "uuid",
        "user": {
          "nickname": "用户***",
          "avatar": "https://...",
          "level": "gold"
        },
        "rating": 5,
        "content": "非常好用，强烈推荐！",
        "images": ["https://...", "https://..."],
        "specInfo": "自然色 / 30ml",
        "purchaseTime": "2024-01-01",
        "isVerified": true,
        "likeCount": 25,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 128,
    "page": 1
  }
}
```

#### 3.4 获取商品分类
```http
GET /categories
```

**响应数据**:
```json
{
  "code": 200,
  "data": [
    {
      "id": "uuid",
      "name": "护肤系列",
      "icon": "https://...",
      "children": [
        {
          "id": "uuid",
          "name": "洁面产品",
          "children": []
        }
      ]
    }
  ]
}
```

---

### 4. 购物车相关接口

#### 4.1 获取购物车
```http
GET /cart
```

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "cartId": "uuid",
        "productId": "uuid",
        "productName": "商品名称",
        "productImage": "https://...",
        "specInfo": "自然色 / 30ml",
        "price": 299.00,
        "quantity": 2,
        "stock": 100,
        "isSelected": true,
        "isValid": true
      }
    ],
    "selectedCount": 2,
    "totalPrice": 598.00
  }
}
```

#### 4.2 添加到购物车
```http
POST /cart
```

**请求参数**:
```json
{
  "productId": "uuid",
  "skuId": "uuid",
  "quantity": 1
}
```

#### 4.3 更新购物车商品
```http
PUT /cart/:cartId
```

**请求参数**:
```json
{
  "quantity": 2,
  "isSelected": true
}
```

#### 4.4 删除购物车商品
```http
DELETE /cart/:cartId
```

#### 4.5 清空购物车
```http
DELETE /cart/clear
```

---

### 5. 订单相关接口

#### 5.1 确认订单
```http
POST /orders/confirm
```

**请求参数**:
```json
{
  "cartIds": ["uuid1", "uuid2"],
  "addressId": "uuid",
  "couponId": "uuid"
}
```

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "products": [...],
    "address": {...},
    "shippingFee": 10.00,
    "totalAmount": 598.00,
    "discountAmount": 50.00,
    "finalAmount": 558.00,
    "availableCoupons": [...]
  }
}
```

#### 5.2 创建订单
```http
POST /orders
```

**请求参数**:
```json
{
  "cartIds": ["uuid1", "uuid2"],
  "addressId": "uuid",
  "shippingMethod": "express",
  "paymentMethod": "wechat",
  "couponId": "uuid",
  "pointsUsed": 100,
  "invoiceType": "personal",
  "invoiceInfo": {...},
  "remark": "请尽快发货"
}
```

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "orderId": "uuid",
    "orderNo": "202401150001",
    "finalAmount": 558.00,
    "paymentInfo": {
      "method": "wechat",
      "qrCode": "data:image/png;base64,...",
      "expireTime": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### 5.3 获取订单列表
```http
GET /orders?page=1&limit=10&status=pending_shipment
```

**查询参数**:
- page: 页码
- limit: 每页数量
- status: 订单状态

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "uuid",
        "orderNo": "202401150001",
        "status": "pending_shipment",
        "items": [
          {
            "productName": "商品名称",
            "productImage": "https://...",
            "specInfo": "自然色 / 30ml",
            "price": 299.00,
            "quantity": 2
          }
        ],
        "totalAmount": 598.00,
        "finalAmount": 558.00,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1
  }
}
```

#### 5.4 获取订单详情
```http
GET /orders/:id
```

#### 5.5 取消订单
```http
PUT /orders/:id/cancel
```

**请求参数**:
```json
{
  "reason": "不想要了"
}
```

#### 5.6 确认收货
```http
PUT /orders/:id/receive
```

#### 5.7 申请退款
```http
POST /orders/:id/refund
```

**请求参数**:
```json
{
  "type": "refund_only",
  "reason": "七天无理由退货",
  "description": "详细说明",
  "images": ["https://...", "https://..."],
  "refundAmount": 299.00
}
```

---

### 6. 地址相关接口

#### 6.1 获取地址列表
```http
GET /addresses
```

#### 6.2 添加地址
```http
POST /addresses
```

**请求参数**:
```json
{
  "name": "张三",
  "phone": "13800138000",
  "province": "北京市",
  "city": "北京市",
  "district": "朝阳区",
  "detail": "xxx街道xxx号",
  "postalCode": "100000",
  "isDefault": true,
  "tag": "home"
}
```

#### 6.3 更新地址
```http
PUT /addresses/:id
```

#### 6.4 删除地址
```http
DELETE /addresses/:id
```

#### 6.5 设置默认地址
```http
PUT /addresses/:id/default
```

---

### 7. 优惠券相关接口

#### 7.1 获取可用优惠券列表
```http
GET /coupons/available?amount=299
```

#### 7.2 获取我的优惠券
```http
GET /user/coupons?status=available
```

#### 7.3 领取优惠券
```http
POST /coupons/:id/receive
```

---

### 8. 收藏相关接口

#### 8.1 添加收藏
```http
POST /favorites
```

**请求参数**:
```json
{
  "type": "product",
  "targetId": "uuid"
}
```

#### 8.2 取消收藏
```http
DELETE /favorites/:id
```

#### 8.3 获取收藏列表
```http
GET /favorites?type=product&page=1&limit=20
```

---

### 9. 搜索相关接口

#### 9.1 搜索商品
```http
GET /search?keyword=保湿精华&page=1&limit=20
```

#### 9.2 搜索建议
```http
GET /search/suggest?keyword=保湿
```

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "suggestions": [
      "保湿精华",
      "保湿面霜",
      "保湿面膜"
    ],
    "hotKeywords": [
      "补水保湿",
      "美白精华",
      "抗衰老"
    ]
  }
}
```

#### 9.3 热门搜索
```http
GET /search/hot
```

---

### 10. 评价相关接口

#### 10.1 提交评价
```http
POST /reviews
```

**请求参数**:
```json
{
  "orderId": "uuid",
  "productId": "uuid",
  "rating": 5,
  "content": "非常好用！",
  "images": ["https://...", "https://..."],
  "isAnonymous": false
}
```

#### 10.2 获取待评价订单
```http
GET /reviews/pending
```

---

### 11. 后台管理接口

#### 11.1 商品管理

**获取商品列表**:
```http
GET /admin/products?page=1&limit=20&status=online
```

**创建商品**:
```http
POST /admin/products
```

**更新商品**:
```http
PUT /admin/products/:id
```

**删除商品**:
```http
DELETE /admin/products/:id
```

**批量上架/下架**:
```http
PUT /admin/products/batch-status
```

#### 11.2 订单管理

**订单列表**:
```http
GET /admin/orders?page=1&limit=20&status=pending_shipment
```

**发货**:
```http
PUT /admin/orders/:id/ship
```

**请求参数**:
```json
{
  "shippingCompany": "顺丰速运",
  "shippingNo": "SF1234567890"
}
```

**处理退款**:
```http
PUT /admin/refunds/:id/process
```

**请求参数**:
```json
{
  "action": "approve",
  "remark": "处理备注"
}
```

#### 11.3 用户管理

**用户列表**:
```http
GET /admin/users?page=1&limit=20&keyword=xxx
```

**用户详情**:
```http
GET /admin/users/:id
```

**禁用/启用用户**:
```http
PUT /admin/users/:id/status
```

#### 11.4 数据统计

**仪表盘数据**:
```http
GET /admin/dashboard/statistics
```

**销售统计**:
```http
GET /admin/statistics/sales?startDate=2024-01-01&endDate=2024-01-31
```

---

### 12. 文件上传接口

#### 12.1 上传图片
```http
POST /upload/image
```

**请求格式**: multipart/form-data

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "url": "https://...",
    "width": 800,
    "height": 600,
    "size": 102400
  }
}
```

#### 12.2 上传视频
```http
POST /upload/video
```

---

*文档版本：v1.0*
*下一部分：部署运维方案*
