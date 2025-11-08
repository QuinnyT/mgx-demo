'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading, initialize, initialized } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('请完整填写邮箱和密码');
      return;
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        toast.error('请确认密码');
        return;
      }

      if (password !== confirmPassword) {
        toast.error('两次密码输入不一致');
        return;
      }

      if (password.length < 6) {
        toast.error('密码长度至少 6 位');
        return;
      }
    }

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        toast.success('登录成功');
      } else {
        await signUp(email, password);
        toast.success('账号创建成功，已自动登录');
      }
      navigate('/', { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : mode === 'signin' ? '登录失败' : '注册失败';
      toast.error(errorMessage);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f0ff] via-white to-[#f1f5ff]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 py-10 lg:flex-row lg:items-stretch lg:gap-20 lg:px-12">
        <div className="flex flex-1 flex-col justify-center gap-10 text-center lg:text-left">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
              <span aria-hidden className="h-2 w-2 rounded-full bg-purple-500" />
              MGX · AI 团队助手
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Dream, Chat, Create
              <br />
              Your{' '}
              <span className="bg-gradient-to-r from-[#805bff] via-[#a855f7] to-[#4f46e5] bg-clip-text font-bold text-transparent">
                24/7 AI Team
              </span>
            </h1>
            <p className="text-lg leading-relaxed text-slate-600">
              Providing the First AI Software Company · 随时随地与 AI 携手协作，共建创意无限的产品体验。
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-tr from-[#f1e6ff] via-white to-[#e0f2ff] p-8 shadow-[0_30px_80px_-40px_rgba(79,70,229,0.45)] lg:mx-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#c7d2fe]/60" />
            <div className="relative flex flex-wrap items-end justify-center gap-4">
              <div className="h-36 w-36 rounded-full bg-white/80 shadow-xl backdrop-blur">
                <img
                  src="https://cdn.jsdelivr.net/gh/leerob/static@main/misc/mgx-team-character-1.png"
                  alt="MGX AI Character 1"
                  loading="lazy"
                  className="h-full w-full object-contain p-4"
                />
              </div>
              <div className="h-32 w-32 -translate-y-6 rounded-full bg-white/80 shadow-xl backdrop-blur">
                <img
                  src="https://cdn.jsdelivr.net/gh/leerob/static@main/misc/mgx-team-character-2.png"
                  alt="MGX AI Character 2"
                  loading="lazy"
                  className="h-full w-full object-contain p-4"
                />
              </div>
              <div className="h-36 w-36 rounded-full bg-white/80 shadow-xl backdrop-blur">
                <img
                  src="https://cdn.jsdelivr.net/gh/leerob/static@main/misc/mgx-team-character-3.png"
                  alt="MGX AI Character 3"
                  loading="lazy"
                  className="h-full w-full object-contain p-4"
                />
              </div>
            </div>
          </div>
        </div>

        <Card className="flex w-full max-w-md flex-1 flex-col justify-center border-none bg-white/75 shadow-xl backdrop-blur">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold text-slate-900">Welcome Back</CardTitle>
            <CardDescription className="text-base text-slate-500">
              {mode === 'signin' ? '使用已有账号登录继续创作' : '填写信息创建你的 MGX 账号'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center gap-3 border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
              onClick={() => toast.info('Google 登录尚未配置，请使用邮箱密码登录')}
              disabled={loading}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-inner">
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path
                    fill="#4285F4"
                    d="M21.35 10.04h-9.17v3.92h5.36c-.23 1.23-.93 2.28-1.99 2.98v2.48h3.22c1.89-1.74 2.98-4.3 2.98-7.34 0-.7-.06-1.37-.16-2.04z"
                  />
                  <path
                    fill="#34A853"
                    d="M12.18 22c2.7 0 4.96-.9 6.61-2.45l-3.22-2.48c-.9.6-2.06.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.27v2.6A9.818 9.818 0 0 0 12.18 22z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.57 13.9a5.873 5.873 0 0 1-.31-1.9c0-.66.11-1.3.3-1.9V7.5H3.27A9.809 9.809 0 0 0 2.18 12c0 1.56.37 3.03 1.09 4.5l3.3-2.6z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12.18 6.5c1.47 0 2.78.51 3.81 1.5l2.86-2.86C17.13 3.55 14.87 2.6 12.18 2.6 7.99 2.6 4.33 4.97 3.27 7.5l3.3 2.6c.79-2.36 3-4.1 5.61-4.1z"
                  />
                </svg>
              </span>
              使用 Google 登录
            </Button>

            <div className="relative text-center text-sm text-slate-400">
              <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-slate-200" aria-hidden />
              <span className="relative inline-block bg-white px-3 text-slate-400">或使用邮箱</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-600">
                  邮箱
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-10"
                  />
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-600">
                  密码
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="至少 6 位字符"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-600">
                    确认密码
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'signin' ? '登录' : '注册并登录'}
              </Button>
            </form>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <button
                type="button"
                className="transition-colors hover:text-slate-700"
                onClick={() => toast.info('请联系管理员以重置密码')}
              >
                忘记密码？
              </button>
              <button
                type="button"
                className="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  resetForm();
                }}
              >
                {mode === 'signin' ? '还没有账号？立即注册' : '已有账号？去登录'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}