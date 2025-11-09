import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Languages,
  Loader2,
  LogOut,
  Menu,
  Paperclip,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';

import { LANG_STORAGE_KEY, languageOptions } from '@/i18n';
import { useAuthStore } from '@/lib/store/auth-store';
import { useChatStore } from '@/lib/store/chat-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const quickActions = [
  { key: 'slides', icon: BadgeCheck },
  { key: 'research', icon: Sparkles },
  { key: 'blog', icon: Globe2 },
  { key: 'linkHub', icon: Send },
] as const;

export default function IndexPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, initialize, initialized, signOut } = useAuthStore();
  const { createConversation, sendMessage, setCurrentConversation, fetchMessages, generateProject } = useChatStore();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ recents: true, pinned: true });
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [promptSubmitting, setPromptSubmitting] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // useEffect(() => {
  //   if (user) {
  //     navigate('/chat');
  //   }
  // }, [user, navigate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedLanguage = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage);
      setSelectedLanguage(storedLanguage);
    }

    const handleLanguageChanged = (lng: string) => {
      setSelectedLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const sampleChats = useMemo(() => {
    const chats = t('sidebar.sampleChats') as unknown;
    return Array.isArray(chats) ? (chats as string[]) : [];
  }, [t]);

  const conversationSections = useMemo(
    () => [
      {
        key: 'recents',
        title: t('sidebar.recents'),
        items: sampleChats.slice(0, 3),
      },
      {
        key: 'pinned',
        title: t('sidebar.pinned'),
        items: sampleChats.slice(3),
      },
    ],
    [sampleChats, t],
  );

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANG_STORAGE_KEY, code);
    }
    setSelectedLanguage(code);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error(error);
    }
  };

  const handlePromptSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = prompt.trim();
    if (!value || promptSubmitting) return;

    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    try {
      setPromptSubmitting(true);
      const truncatedTitle = value.length > 60 ? `${value.slice(0, 57)}...` : value;
      
      // Create conversation
      const conversation = await createConversation(truncatedTitle);
      
      // Send user message
      await sendMessage(value, 'user');
      
      // Generate project with AI
      const version = await generateProject(value);
      
      // Send AI response with summary
      if (version.summary) {
        await sendMessage(version.summary, 'assistant');
      }
      
      // Fetch all messages to sync
      await fetchMessages(conversation.id);
      
      // Set current conversation and navigate
      setCurrentConversation(conversation);
      navigate(`/chat?conversation=${conversation.id}`);
      setPrompt('');
      
      toast.success('Project generated successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start conversation';
      toast.error(message);
      console.error('Error in handlePromptSubmit:', error);
    } finally {
      setPromptSubmitting(false);
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#f8f5ff] via-white to-[#f1f5ff] text-slate-900">
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>{t('dialog.title')}</DialogTitle>
            <DialogDescription>{t('dialog.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex w-full flex-row justify-center gap-3 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setAuthDialogOpen(false);
                navigate('/login?mode=signup');
              }}
            >
              {t('dialog.signUp')}
            </Button>
            <Button
              onClick={() => {
                setAuthDialogOpen(false);
                navigate('/login');
              }}
            >
              {t('dialog.signIn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Promo Banner */}
      {showPromoBanner && (
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-center text-white">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>限时 21% 折扣,立即抢购!</span>
          </div>
          <button
            onClick={() => setShowPromoBanner(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-white/20"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <header className="border-b border-purple-100/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#805bff] to-[#4f46e5] text-sm font-semibold text-white">
                MGX
              </div>
              <span className="text-lg font-semibold">MGX</span>
            </div>
            <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
              {['learn', 'pricing', 'resources', 'affiliates', 'launched'].map((item) => (
                <button key={item} type="button" className="transition-colors hover:text-slate-900">
                  {t(`nav.${item}` as const)}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="sm" className="hidden items-center gap-1 text-purple-600 hover:text-purple-700 md:inline-flex">
              {t('nav.brandCta')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2 text-sm">
                  <Languages className="h-4 w-4" />
                  <span className="hidden md:inline">
                    {languageOptions.find((option) => option.code === selectedLanguage)?.label ?? selectedLanguage}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {languageOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.code}
                    className="flex items-center justify-between text-sm"
                    onClick={() => handleLanguageChange(option.code)}
                  >
                    <span>{option.label}</span>
                    {selectedLanguage === option.code && <Check className="h-3.5 w-3.5" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-muted-foreground">{t('nav.language')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/chat')} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden md:inline">Chat</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-sm">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  {t('nav.signIn')}
                </Button>
                <Button
                  size="sm"
                  className="bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => navigate('/login?mode=signup')}
                >
                  {t('nav.signUp')}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside 
          className={cn(
            "hidden flex-shrink-0 flex-col border-r border-slate-200/60 bg-white/75 backdrop-blur transition-all duration-300 md:flex",
            sidebarCollapsed ? "w-16" : "w-72"
          )}
        >
          {/* Toggle Button */}
          <div className="flex items-center justify-between border-b border-slate-200/60 p-3">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <Menu className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">MGX</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <Button 
              className={cn(
                "w-full bg-gradient-to-r from-[#805bff] to-[#4f46e5] text-white hover:from-[#6f4de4] hover:to-[#3d3ac7]",
                sidebarCollapsed ? "justify-center px-0" : "justify-start gap-2"
              )}
              onClick={() => user ? navigate('/chat') : navigate('/login')}
            >
              <Sparkles className="h-4 w-4" />
              {!sidebarCollapsed && t('sidebar.newChat')}
            </Button>
          </div>

          {/* App World Button */}
          <div className="px-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "w-full text-sm text-slate-600 hover:text-slate-900",
                sidebarCollapsed ? "justify-center px-0" : "justify-start gap-2"
              )}
            >
              <Globe2 className="h-4 w-4" />
              {!sidebarCollapsed && t('sidebar.appWorld')}
            </Button>
          </div>

          {!sidebarCollapsed && (
            <>
              {/* My Chats Label */}
              <div className="mt-6 px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('sidebar.myChats')}
              </div>

              {/* Conversations List */}
              <ScrollArea className="mt-2 flex-1 px-2">
                <div className="space-y-3">
                  {conversationSections.map((section) => (
                    <Collapsible
                      key={section.key}
                      open={openSections[section.key]}
                      onOpenChange={(value) => setOpenSections((prev) => ({ ...prev, [section.key]: value }))}
                      className="rounded-xl border border-transparent hover:border-slate-200"
                    >
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
                        <span>{section.title}</span>
                        <ChevronDown
                          className={cn('h-4 w-4 transition-transform', openSections[section.key] ? 'rotate-180' : 'rotate-0')}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 px-2 pb-3">
                        {section.items.map((item, index) => (
                          <button
                            key={`${section.key}-${index}`}
                            type="button"
                            className="flex w-full flex-col gap-1 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
                          >
                            <span className="font-medium">{item}</span>
                            <span className="text-xs text-slate-400">Claude · 2 min ago</span>
                          </button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </ScrollArea>

              {/* Credits Card */}
              <div className="border-t border-slate-200/70 p-4">
                <Card className="border-none bg-slate-900 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('sidebar.credits')}</CardTitle>
                    <CardDescription className="text-xs text-slate-300">331.54 {t('sidebar.credits')}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button size="sm" className="w-full bg-white text-slate-900 hover:bg-slate-100">
                      {t('sidebar.upgrade')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 md:px-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white/80 px-4 py-1 text-xs font-semibold text-purple-700 shadow-sm">
                <Badge variant="outline" className="border-0 bg-purple-100 text-purple-700">
                  {t('main.badge')}
                </Badge>
                <span>{t('main.updateTitle')}</span>
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">{t('main.heroTitle')}</h1>
              <p className="max-w-xl text-sm text-slate-500 md:text-base">{t('main.heroPlaceholder')}</p>
            </div>

            <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200/70 bg-white/85 p-8 shadow-xl backdrop-blur-sm">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {t('main.newBadge')}
                  </span>
                  <span>Claude Sonnet 4.5</span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-500 shadow-sm">
                    {t('main.heroPlaceholder')}
                  </div>
                  <form
                    onSubmit={handlePromptSubmit}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <Paperclip className="h-4 w-4 text-slate-400" />
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="border-none bg-transparent p-0 text-base text-slate-700 placeholder:text-slate-400 focus-visible:ring-0"
                      placeholder={t('main.promptPlaceholder')}
                      disabled={promptSubmitting}
                    />
                    <Button type="submit" size="icon" className="rounded-full bg-slate-900 text-white hover:bg-slate-800" disabled={promptSubmitting}>
                      {promptSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {quickActions.map(({ key, icon: Icon }) => (
                    <Button
                      key={key}
                      variant="outline"
                      className="justify-start gap-3 border-slate-200 bg-white text-left text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    >
                      <Icon className="h-4 w-4 text-slate-500" />
                      {t(`main.actions.${key}` as const)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <footer className="mt-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/70 bg-white/70 px-6 py-5 text-sm text-slate-600 shadow-sm">
                <div className="flex items-center gap-6">
                  {[t('main.discover'), t('main.showcase'), t('main.likes')].map((label) => (
                    <button key={label} type="button" className="transition-colors hover:text-slate-900">
                      {label}
                    </button>
                  ))}
                </div>
                <Button variant="link" className="p-0 text-indigo-500 hover:text-indigo-600">
                  {t('main.viewAll')}
                </Button>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}