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
  Globe,
  Globe2,
  Languages,
  Linkedin,
  Loader2,
  LogOut,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Pin,
  Plus,
  Presentation,
  BookOpen,
  Link2,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
  Database,
  Image as ImageIcon,
} from 'lucide-react';

import { LANG_STORAGE_KEY, languageOptions } from '@/i18n';
import { useAuthStore } from '@/lib/store/auth-store';
import { useChatStore } from '@/lib/store/chat-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function IndexPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, initialize, initialized, signOut } = useAuthStore();
  const { 
    conversations,
    createConversation, 
    sendMessage, 
    setCurrentConversation,
    deleteConversation,
    togglePinConversation,
  } = useChatStore();

  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [promptSubmitting, setPromptSubmitting] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [workMode, setWorkMode] = useState<'team' | 'engineer'>('engineer');
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4.5');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

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
      toast.success(t('auth.messages.signInSuccess'));
      navigate('/login');
    } catch (error) {
      toast.error(t('auth.messages.signInError'));
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
      
      const conversation = await createConversation(truncatedTitle);
      await sendMessage(value, 'user');
      setCurrentConversation(conversation);
      navigate(`/chat?conversation=${conversation.id}&prompt=${encodeURIComponent(value)}`);
      setPrompt('');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.messages.signInError');
      toast.error(message);
      console.error('Error in handlePromptSubmit:', error);
    } finally {
      setPromptSubmitting(false);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
      console.error(error);
    }
  };

  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await togglePinConversation(id);
    } catch (error) {
      toast.error('Failed to pin conversation');
      console.error(error);
    }
  };

  const pinnedConversations = useMemo(
    () => conversations.filter((c) => c.pinned),
    [conversations]
  );

  const recentConversations = useMemo(
    () => conversations.filter((c) => !c.pinned).slice(0, 10),
    [conversations]
  );

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-center text-white">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>{t('nav.brandTag')}</span>
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

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left - Logo and Navigation */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded"></div>
              <span className="text-base font-semibold">MGX</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-sm h-8 px-3">
                {t('nav.learn')}
              </Button>
              <Button variant="ghost" size="sm" className="text-sm h-8 px-3">
                {t('nav.pricing')}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-sm h-8 px-3">
                    {t('nav.resources')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Documentation</DropdownMenuItem>
                  <DropdownMenuItem>Tutorials</DropdownMenuItem>
                  <DropdownMenuItem>API Reference</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" className="text-sm h-8 px-3">
                {t('nav.affiliates')}
              </Button>
              <Button variant="ghost" size="sm" className="text-sm h-8 px-3">
                {t('nav.launched')}
              </Button>
            </nav>
          </div>

          {/* Right - Language, Social, User */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-sm h-8 px-3">
                  <Globe className="h-4 w-4" />
                  {languageOptions.find((option) => option.code === selectedLanguage)?.label ?? 'EN'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languageOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.code}
                    className="flex items-center justify-between"
                    onClick={() => handleLanguageChange(option.code)}
                  >
                    <span>{option.label}</span>
                    {selectedLanguage === option.code && <Check className="h-3.5 w-3.5" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Linkedin className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </Button>

            <div className="h-6 w-px bg-border"></div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-sm h-8 px-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.signIn')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            'border-r bg-white/50 backdrop-blur transition-all duration-300',
            sidebarCollapsed ? 'w-0' : 'w-64'
          )}
        >
          <div className={cn('flex h-full flex-col', sidebarCollapsed && 'hidden')}>
            {/* Sidebar Header */}
            <div className="border-b p-4">
              <Button
                onClick={() => {
                  if (!user) {
                    setAuthDialogOpen(true);
                    return;
                  }
                  navigate('/chat');
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('sidebar.newChat')}
              </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
              {user ? (
                <>
                  {pinnedConversations.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                        {t('sidebar.pinned')}
                      </div>
                      {pinnedConversations.map((conv) => (
                        <div
                          key={conv.id}
                          className="group relative mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                          onClick={() => navigate(`/chat?conversation=${conv.id}`)}
                        >
                          <MessageSquare className="h-4 w-4 shrink-0" />
                          <span className="flex-1 truncate">{conv.title}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => handleTogglePin(conv.id, e)}
                            >
                              <Pin className="h-3 w-3 fill-current" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {recentConversations.length > 0 && (
                    <div>
                      <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                        {t('sidebar.recents')}
                      </div>
                      {recentConversations.map((conv) => (
                        <div
                          key={conv.id}
                          className="group relative mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                          onClick={() => navigate(`/chat?conversation=${conv.id}`)}
                        >
                          <MessageSquare className="h-4 w-4 shrink-0" />
                          <span className="flex-1 truncate">{conv.title}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => handleTogglePin(conv.id, e)}
                            >
                              <Pin className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {conversations.length === 0 && (
                    <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                      {t('sidebar.myChats')}
                    </div>
                  )}
                </>
              ) : (
                <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                  {t('dialog.description')}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-r-lg border border-l-0 bg-white/80 backdrop-blur"
          style={{ left: sidebarCollapsed ? '0' : '16rem' }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Main Content Area */}
        <main className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl flex flex-col h-[calc(100vh-12rem)]">
            {/* Agent Avatars */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🐶</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🐱</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🐰</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🐸</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🐷</span>
              </div>
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400">
                <Plus className="h-5 w-5 text-gray-400" />
              </Button>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t('main.heroTitle')}
            </h1>

            {/* Update Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-4 py-2 text-sm shadow-sm">
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                  {t('main.badge')}
                </Badge>
                <span className="text-gray-700">{t('main.updateTitle')}</span>
              </div>
            </div>

            {/* Chat Input Area - Increased Height */}
            <div className="flex-1 flex flex-col">
              <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border-0 p-6 mb-4">
                <form onSubmit={handlePromptSubmit} className="space-y-4">
                  <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-2xl min-h-[120px]">
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={t('main.heroPlaceholder')}
                      disabled={promptSubmitting}
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base resize-none min-h-[80px]"
                      style={{ minHeight: '80px' }}
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={promptSubmitting || !prompt.trim()}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-full mt-2"
                    >
                      {promptSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Bottom Toolbar */}
                  <div className="flex items-center justify-between px-2">
                    {/* Left - Tools */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Database className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-xs">
                        <Sparkles className="h-3 w-3" />
                        {t('main.newBadge')}
                      </Button>
                    </div>

                    {/* Center - Mode Switch */}
                    <Tabs value={workMode} onValueChange={(v) => setWorkMode(v as 'team' | 'engineer')}>
                      <TabsList className="h-8">
                        <TabsTrigger value="team" className="text-xs h-7 px-3">Team Mode</TabsTrigger>
                        <TabsTrigger value="engineer" className="text-xs h-7 px-3">Engineer Mode</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {/* Right - Model Selection */}
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent side="top">
                        <SelectItem value="claude-sonnet-4.5">Claude Sonnet 4.5</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-center gap-6">
                <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-white/50">
                  <Presentation className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-gray-600">{t('main.actions.slides')}</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-white/50">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-gray-600">{t('main.actions.research')}</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-white/50">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-gray-600">{t('main.actions.blog')}</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-white/50">
                  <Link2 className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-gray-600">{t('main.actions.linkHub')}</span>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}