'use client';

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type AuthMode = 'signin' | 'signup';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, signIn, signUp, signInWithGoogle, loading, initialize, initialized } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreePolicy, setAgreePolicy] = useState(false);

  const isSignup = mode === 'signup';

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const requestedMode = search.get('mode');
    if (requestedMode === 'signup') {
      setMode('signup');
    }
  }, [location.search]);

  useEffect(() => {
    if (user) {
      navigate('/chat', { replace: true });
    }
  }, [user, navigate]);

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAgreePolicy(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Note: The user will be redirected to Google's OAuth page
      // After successful authentication, they'll be redirected back to /chat
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('auth.messages.googleSignInError', { defaultValue: 'Failed to sign in with Google' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(t('auth.messages.fillFields'));
      return;
    }

    if (isSignup) {
      if (!username.trim()) {
        toast.error(t('auth.messages.usernameRequired', { defaultValue: 'Please choose a username' }));
        return;
      }

      if (!confirmPassword) {
        toast.error(t('auth.messages.confirmPassword'));
        return;
      }

      if (password !== confirmPassword) {
        toast.error(t('auth.messages.mismatch'));
        return;
      }

      if (password.length < 6) {
        toast.error(t('auth.messages.passwordLength'));
        return;
      }

      if (!agreePolicy) {
        toast.error(t('auth.messages.acceptPolicy', { defaultValue: 'Please agree to the terms to continue' }));
        return;
      }
    }

    try {
      if (isSignup) {
        await signUp(email, password, {
          username: username.trim(),
        });
        toast.success(t('auth.messages.signUpSuccess'));
      } else {
        await signIn(email, password);
        toast.success(t('auth.messages.signInSuccess'));
      }

      resetForm();
      navigate('/chat', { replace: true });
    } catch (error) {
      const fallback = isSignup ? t('auth.messages.signUpError') : t('auth.messages.signInError');
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error(fallback);
      }
    }
  };

  const switchMode = (target: AuthMode) => {
    setMode(target);
    if (target === 'signin') {
      setAgreePolicy(false);
    }
  };

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f3f0ff] via-white to-[#f1f5ff]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8f5ff] via-white to-[#f1f5ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Left Side - Hero Section */}
        <div className="flex flex-col items-center gap-8 text-center lg:items-start lg:text-left">
          <div className="w-full max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
              <span aria-hidden className="h-2 w-2 rounded-full bg-purple-500" />
              MGX · AI 团队助手
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Dream, Chat, Create
              <br />
              Your{' '}
              <span className="bg-gradient-to-r from-[#805bff] via-[#a855f7] to-[#4f46e5] bg-clip-text font-bold text-transparent">
                24/7 AI Team
              </span>
            </h1>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              Providing the First AI Software Company · 随时随地与 AI 携手协作，共建创意无限的产品体验。
            </p>
          </div>

          {/* AI Characters - Hidden on mobile, visible on lg+ */}
          <div className="relative hidden w-full max-w-xl overflow-hidden rounded-3xl bg-gradient-to-tr from-[#f1e6ff] via-white to-[#e0f2ff] p-8 shadow-[0_30px_80px_-40px_rgba(79,70,229,0.45)] lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#c7d2fe]/60" />
            <div className="relative flex flex-wrap items-end justify-center gap-4">
              <div className="h-32 w-32 rounded-full bg-white/80 shadow-xl backdrop-blur lg:h-36 lg:w-36">
                <img
                  src="/images/MGXAICharacter.jpg"
                  alt="MGX AI Character 1"
                  loading="lazy"
                  className="h-full w-full object-contain p-4"
                />
              </div>
              <div className="h-28 w-28 -translate-y-6 rounded-full bg-white/80 shadow-xl backdrop-blur lg:h-32 lg:w-32">
                <img
                  src="/images/photo1762701759.jpg"
                  alt="MGX AI Character 2"
                  loading="lazy"
                  className="h-full w-full object-contain p-4"
                />
              </div>
              <div className="h-32 w-32 rounded-full bg-white/80 shadow-xl backdrop-blur lg:h-36 lg:w-36">
                <img
                  src="/images/photo1762701760.jpg"
                  alt="MGX AI Character 3"
                  loading="lazy"
                  className="h-full w-full object-contain p-4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex w-full justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <Card className="border-none bg-white/80 shadow-xl backdrop-blur">
              <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-2xl font-semibold text-slate-900">
                  {isSignup ? t('auth.dialogTitleSignUp') : t('auth.dialogTitleSignIn')}
                </CardTitle>
                <CardDescription className="text-base text-slate-500">
                  {isSignup
                    ? t('auth.signupSubtitle', { defaultValue: 'Sign up with Google or email' })
                    : t('auth.signinSubtitle', { defaultValue: 'Sign in with Google or your registered account' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center gap-3 border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  onClick={handleGoogleSignIn}
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
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSignup
                    ? t('auth.signUpWithGoogle', { defaultValue: 'Sign up with Google' })
                    : t('auth.signInWithGoogle', { defaultValue: 'Sign in with Google' })}
                </Button>

                <div className="relative text-center text-sm text-slate-400">
                  <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-slate-200" aria-hidden />
                  <span className="relative inline-block bg-white px-3 text-slate-400">
                    {isSignup
                      ? t('auth.signupWithEmail', { defaultValue: 'Or sign up with email' })
                      : t('auth.signinWithEmail', { defaultValue: 'Or sign in with email' })}
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignup && (
                    <div className="space-y-2">
                      <Label htmlFor="username">{t('auth.username', { defaultValue: 'Username' })}</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder={t('auth.usernamePlaceholder', { defaultValue: 'Enter your username' })}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder={isSignup ? 'Email: *****@example.com' : 'you@example.com'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="pl-10"
                      />
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  {isSignup && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  )}

                  {isSignup && (
                    <label className="flex items-start gap-2 text-sm text-slate-500">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                        checked={agreePolicy}
                        onChange={(e) => setAgreePolicy(e.target.checked)}
                        disabled={loading}
                      />
                      <span>
                        {t('auth.agreeTo', { defaultValue: 'Agree to our ' })}
                        <button
                          type="button"
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                          onClick={() => toast.info('Terms coming soon')}
                        >
                          {t('auth.terms', { defaultValue: 'Terms' })}
                        </button>{' '}
                        {t('auth.and', { defaultValue: 'and' })}{' '}
                        <button
                          type="button"
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                          onClick={() => toast.info('Privacy policy coming soon')}
                        >
                          {t('auth.privacyPolicy', { defaultValue: 'Privacy Policy' })}
                        </button>
                      </span>
                    </label>
                  )}

                  <Button type="submit" className="w-full" disabled={loading || (isSignup && !agreePolicy)}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSignup ? t('auth.continue', { defaultValue: 'Continue' }) : t('auth.signInAction')}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 text-sm text-slate-500">
                {!isSignup && (
                  <button
                    type="button"
                    className="self-start transition-colors hover:text-slate-700"
                    onClick={() => toast.info(t('auth.messages.contactAdmin'))}
                  >
                    {t('auth.forgotPassword')}
                  </button>
                )}
                <div className="text-center text-sm text-slate-500">
                  {isSignup ? (
                    <>
                      {t('auth.haveAccount', { defaultValue: 'Already have an account?' })}
                      <button
                        type="button"
                        className="ml-1 font-medium text-indigo-600 hover:text-indigo-500"
                        onClick={() => switchMode('signin')}
                      >
                        {t('auth.signInNow', { defaultValue: 'Sign in now' })}
                      </button>
                    </>
                  ) : (
                    <>
                      {t('auth.needAccount', { defaultValue: "Don't have an account?" })}
                      <button
                        type="button"
                        className="ml-1 font-medium text-indigo-600 hover:text-indigo-500"
                        onClick={() => switchMode('signup')}
                      >
                        {t('auth.switchToSignUp')}
                      </button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}