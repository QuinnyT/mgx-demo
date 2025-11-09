# Google OAuth 配置指南

## 问题描述
当使用 Google 登录时出现错误：`Error 400: redirect_uri_mismatch` 或 `accounts.google.com refused to connect`

## 解决方案

### 1. Supabase Dashboard 配置

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目：`xjlauxixfwanrfhpzxfe`
3. 进入 **Authentication** → **URL Configuration**
4. 配置以下 URL：

#### Site URL（站点 URL）
```
开发环境：http://localhost:5173
生产环境：https://your-production-domain.com
MGX 分享链接：https://mgx.dev
```

#### Redirect URLs（重定向 URL）
添加以下所有 URL（每行一个）：
```
http://localhost:5173
http://localhost:5173/chat
https://your-production-domain.com
https://your-production-domain.com/chat
https://mgx.dev/app/*
https://xjlauxixfwanrfhpzxfe.supabase.co/auth/v1/callback
```

### 2. Google Cloud Console 配置

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择您的项目
3. 进入 **APIs & Services** → **Credentials**
4. 找到您的 OAuth 2.0 客户端 ID（名称可能是 "gmx-demo"）
5. 点击编辑
6. 在 **授权重定向 URI** 部分，添加以下 URI：

```
https://xjlauxixfwanrfhpzxfe.supabase.co/auth/v1/callback
```

**重要提示：**
- 确保 URI 完全匹配，包括 `https://` 前缀
- 不要有尾部斜杠 `/`
- 保存后可能需要等待几分钟才能生效

### 3. 针对 MGX 分享链接的额外配置

#### 问题：分享链接 Google 登录失败
**分享链接格式：** `https://mgx.dev/app/0a2196a0bbc4450f85d308e8db0fbc9b`
**错误信息：** `accounts.google.com refused to connect`

#### 解决步骤：

1. **确认 Supabase 回调 URL 已添加**
   - 在 Google Cloud Console 中确认已添加：
     ```
     https://xjlauxixfwanrfhpzxfe.supabase.co/auth/v1/callback
     ```

2. **添加 MGX 域名到 Supabase 配置**
   - 在 Supabase Dashboard → Authentication → URL Configuration
   - 在 Redirect URLs 中添加：
     ```
     https://mgx.dev/app/*
     ```

3. **检查 Google OAuth 同意屏幕配置**
   - 在 Google Cloud Console → APIs & Services → OAuth consent screen
   - 确保应用状态为 "Published" 或 "In production"
   - 如果是 "Testing" 状态，需要将测试用户添加到允许列表

4. **验证域名所有权（如果需要）**
   - 某些情况下，Google 可能要求验证 `mgx.dev` 域名
   - 如果您不是 `mgx.dev` 的所有者，这可能是限制因素
   - 联系 MGX 平台支持团队获取帮助

### 4. 验证 Google OAuth 配置

在 Supabase Dashboard 中：
1. 进入 **Authentication** → **Providers**
2. 找到 **Google** 提供商
3. 确保已启用
4. 检查 **Client ID** 和 **Client Secret** 是否正确填写

### 5. 测试登录流程

#### 本地开发环境测试：
1. 清除浏览器缓存和 Cookie
2. 访问登录页面：`http://localhost:5173/login`
3. 点击 "Sign in with Google" 按钮
4. 完成 Google 授权
5. 应该会自动重定向到 `/chat` 页面

#### MGX 分享链接测试：
1. 访问分享链接：`https://mgx.dev/app/xxx`
2. 尝试 Google 登录
3. 如果仍然失败，检查浏览器控制台的错误信息
4. 确认重定向 URL 是否正确

## 常见问题

### Q1: 仍然显示 redirect_uri_mismatch 错误
**A:** 
- 检查 Google Cloud Console 中的重定向 URI 是否与 Supabase 回调 URL 完全匹配
- 确保没有多余的空格或字符
- 等待 5-10 分钟让 Google 配置生效

### Q2: 登录后没有重定向到 /chat
**A:**
- 检查 Supabase Dashboard 中的 Site URL 配置
- 确保 Site URL 设置为您的应用根 URL（不包含 /chat）

### Q3: 开发环境和生产环境都需要配置吗？
**A:**
- 是的，两个环境都需要在 Supabase 和 Google Cloud Console 中配置相应的 URL
- 开发环境使用 `localhost:5173`
- 生产环境使用您的实际域名
- MGX 分享链接使用 `mgx.dev` 域名

### Q4: MGX 分享链接显示 "accounts.google.com refused to connect"
**A:**
- 这通常是因为 Google OAuth 配置不完整
- 确保 Supabase 回调 URL 已添加到 Google Cloud Console
- 检查 OAuth 同意屏幕的应用状态
- 如果问题持续，可能需要联系 MGX 平台支持

### Q5: 如何处理跨域问题？
**A:**
- MGX 平台的分享链接可能涉及跨域认证
- 确保 Supabase 项目配置中包含了所有必要的域名
- 检查浏览器控制台是否有 CORS 相关错误

## 代码修改说明

已修改 `src/lib/store/auth-store.ts` 中的 `signInWithGoogle` 方法：
- 移除了自定义的 `redirectTo` 参数
- 现在使用 Supabase Dashboard 中配置的 Site URL
- 添加了 `queryParams` 以请求离线访问权限

## 调试步骤

如果 Google 登录仍然失败，请按以下步骤调试：

1. **打开浏览器开发者工具（F12）**
2. **进入 Network 标签**
3. **点击 Google 登录按钮**
4. **查看网络请求：**
   - 找到重定向到 Google 的请求
   - 检查 `redirect_uri` 参数的值
   - 确认这个值是否在 Google Cloud Console 中配置

5. **检查控制台错误：**
   - 查看是否有 CORS 错误
   - 查看是否有认证相关的错误信息

6. **验证 Supabase 配置：**
   ```bash
   # 在浏览器控制台运行
   console.log(import.meta.env.VITE_SUPABASE_URL)
   console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
   ```

## 联系支持

如果以上步骤都无法解决问题：

1. **Supabase 支持：** https://supabase.com/support
2. **Google OAuth 支持：** https://support.google.com/cloud
3. **MGX 平台支持：** 如果问题与分享链接相关，联系 MGX 平台团队

## 参考链接

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Debugging OAuth Issues](https://supabase.com/docs/guides/auth/debugging)