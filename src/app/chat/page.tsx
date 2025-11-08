'use client';

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/auth-store';
import { useChatStore } from '@/lib/store/chat-store';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Send, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, initialize, initialized } = useAuthStore();
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    fetchConversations,
    createConversation,
    setCurrentConversation,
    sendMessage,
    subscribeToMessages,
  } = useChatStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (initialized && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, initialized, navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  useEffect(() => {
    if (currentConversation) {
      const unsubscribe = subscribeToMessages(currentConversation.id);
      return () => unsubscribe();
    }
  }, [currentConversation, subscribeToMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateConversation = async () => {
    if (!newConversationTitle.trim()) {
      toast.error('Please enter a conversation title');
      return;
    }

    try {
      await createConversation(newConversationTitle);
      toast.success('Conversation created');
      setIsCreateDialogOpen(false);
      setNewConversationTitle('');
    } catch (error) {
      toast.error('Failed to create conversation');
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversation) return;

    setIsSending(true);
    try {
      await sendMessage(messageInput);
      setMessageInput('');
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setIsSending(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-6 flex gap-4">
        {/* Conversations Sidebar */}
        <Card className="w-80 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Conversations</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                  <DialogDescription>
                    Start a new conversation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Conversation title"
                      value={newConversationTitle}
                      onChange={(e) => setNewConversationTitle(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateConversation}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setCurrentConversation(conv)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg hover:bg-accent transition-colors',
                      currentConversation?.id === conv.id && 'bg-accent'
                    )}
                  >
                    <div className="font-medium truncate">{conv.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              <div className="p-4 border-b">
                <h2 className="font-semibold">{currentConversation.title}</h2>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-lg p-3',
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || !messageInput.trim()}
                    size="icon"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a conversation or create a new one to start chatting
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Conversation
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}