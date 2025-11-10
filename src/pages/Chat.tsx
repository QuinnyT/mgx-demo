'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/auth-store';
import { useChatStore } from '@/lib/store/chat-store';
import type { GeneratedProjectVersion } from '@/types';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Send, Loader2, MessageSquare, Image as ImageIcon, Database, Presentation, BookOpen, Link2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, initialize, initialized } = useAuthStore();
  const currentConversation = useChatStore((state) => state.currentConversation);
  const messages = useChatStore((state) => state.messages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const subscribeToMessages = useChatStore((state) => state.subscribeToMessages);
  const generateProject = useChatStore((state) => state.generateProject);
  const conversationId = currentConversation?.id ?? null;

  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [workMode, setWorkMode] = useState<'team' | 'engineer'>('engineer');
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4.5');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (initialized && !user) {
      navigate('/login');
    }
  }, [user, initialized, navigate]);

  useEffect(() => {
    if (currentConversation) {
      const unsubscribe = subscribeToMessages(currentConversation.id);
      return () => unsubscribe();
    }
  }, [currentConversation, subscribeToMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversation) return;

    const prompt = messageInput.trim();
    setMessageInput('');
    setIsSending(true);
    
    try {
      await sendMessage(prompt);
      setIsGenerating(true);
      
      const version = await generateProject(prompt);

      if (version.summary) {
        await sendMessage(version.summary, 'assistant');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate project';
      toast.error(message);
      console.error(error);
    } finally {
      setIsSending(false);
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!initialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl flex flex-col h-[calc(100vh-8rem)]">
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
          <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Build Your Ideas with AI
          </h1>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {messages.length === 0 && !isGenerating ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                      <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-400 text-lg">Start your conversation...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[80%] rounded-2xl px-4 py-3',
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-900',
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isGenerating && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                              <p className="text-sm text-gray-600">Generating...</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="border-t bg-white/90 backdrop-blur p-4">
              <div className="flex items-center gap-2 mb-3">
                <Input
                  placeholder="@agent Type #, describe your project..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending}
                  className="flex-1 border-0 bg-gray-50 focus-visible:ring-1 focus-visible:ring-purple-500"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isSending || !messageInput.trim()} 
                  size="icon"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              {/* Bottom Toolbar */}
              <div className="flex items-center justify-between">
                {/* Left - Add Image and Supabase */}
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
                    New
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
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-white/50">
              <Presentation className="h-5 w-5 text-purple-600" />
              <span className="text-xs text-gray-600">Slides</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-white/50">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="text-xs text-gray-600">Deep Research</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-white/50">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span className="text-xs text-gray-600">Blog</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-white/50">
              <Link2 className="h-5 w-5 text-purple-600" />
              <span className="text-xs text-gray-600">Link Hub</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}