# Google OAuth 配置指南

## 问题描述
当使用 Google 登录时出现错误：`Error 400: redirect_uri_mismatch`

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
```

#### Redirect URLs（重定向 URL）
添加以下所有 URL（每行一个）：
```
http://localhost:5173
http://localhost:5173/chat
https://your-production-domain.com
https://your-production-domain.com/chat
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

### 3. 验证 Google OAuth 配置

在 Supabase Dashboard 中：
1. 进入 **Authentication** → **Providers**
2. 找到 **Google** 提供商
3. 确保已启用
4. 检查 **Client ID** 和 **Client Secret** 是否正确填写

### 4. 测试登录流程

1. 清除浏览器缓存和 Cookie
2. 访问登录页面：`http://localhost:5173/login`
3. 点击 "Sign in with Google" 按钮
4. 完成 Google 授权
5. 应该会自动重定向到 `/chat` 页面

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

## 代码修改说明

已修改 `src/lib/store/auth-store.ts` 中的 `signInWithGoogle` 方法：
- 移除了自定义的 `redirectTo` 参数
- 现在使用 Supabase Dashboard 中配置的 Site URL
- 添加了 `queryParams` 以请求离线访问权限

## 参考链接

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)