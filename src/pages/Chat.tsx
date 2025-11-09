'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/auth-store';
import { useChatStore } from '@/lib/store/chat-store';
import type { GeneratedProject } from '@/types';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
    generateProject,
  } = useChatStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
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

  useEffect(() => {
    setGeneratedProject(null);
    setSelectedFileIndex(0);
  }, [currentConversation?.id]);

  const handleCreateConversation = async () => {
    if (!newConversationTitle.trim()) {
      toast.error('Please enter a conversation title');
      return;
    }

    try {
      const conversation = await createConversation(newConversationTitle);
      toast.success('Conversation created');
      setIsCreateDialogOpen(false);
      setNewConversationTitle('');
      setCurrentConversation(conversation);
      setGeneratedProject(null);
    } catch (error) {
      toast.error('Failed to create conversation');
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversation) return;

    setIsSending(true);
    const prompt = messageInput.trim();
    try {
      await sendMessage(prompt);
      setMessageInput('');

      const project = await generateProject(prompt);
      setGeneratedProject(project);
      setSelectedFileIndex(0);

      if (project.summary) {
        await sendMessage(project.summary, 'assistant');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate project';
      toast.error(message);
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

  const previewDocument = useMemo(() => {
    if (!generatedProject) return null;

    const htmlFile = generatedProject.files.find((file) => file.name.toLowerCase().endsWith('.html'));
    if (!htmlFile) return null;

    const css = generatedProject.files
      .filter((file) => file.name.toLowerCase().endsWith('.css'))
      .map((file) => `<style>${file.content}</style>`)
      .join('\n');

    const scripts = generatedProject.files
      .filter((file) => file.name.toLowerCase().endsWith('.js') || file.name.toLowerCase().endsWith('.ts'))
      .map((file) => `<script type="module">${file.content}</script>`)
      .join('\n');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${css}
</head>
<body>
${htmlFile.content}
${scripts}
</body>
</html>`;
  }, [generatedProject]);

  if (!initialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedFile = generatedProject?.files[selectedFileIndex];

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
                  <DialogDescription>Start a new conversation</DialogDescription>
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
              <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet</div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setCurrentConversation(conv)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg hover:bg-accent transition-colors',
                      currentConversation?.id === conv.id && 'bg-accent',
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

        <div className="flex flex-1 gap-4">
          {/* Chat Area */}
          <Card className="flex-[2] flex flex-col">
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
                          className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[70%] rounded-lg p-3',
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted',
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
                      placeholder="Describe the project you want..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSending}
                    />
                    <Button onClick={handleSendMessage} disabled={isSending || !messageInput.trim()} size="icon">
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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

          {/* Preview Area */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b p-4">
              <h2 className="font-semibold text-slate-800">Project Preview</h2>
              <p className="text-xs text-muted-foreground">
                View the AI generated summary, live preview, and source code files.
              </p>
            </div>
            {generatedProject ? (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="border-b p-4">
                  <h3 className="text-sm font-semibold text-slate-700">Summary</h3>
                  <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">
                    {generatedProject.summary || 'The assistant did not provide a summary.'}
                  </p>
                </div>
                <div className="flex-1 overflow-hidden">
                  {previewDocument ? (
                    <iframe
                      key={currentConversation?.id}
                      title="Project Preview"
                      srcDoc={previewDocument}
                      className="h-64 w-full border-b"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                      No HTML preview available for this project.
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 border-b px-4 py-3">
                    {generatedProject.files.map((file, index) => (
                      <Button
                        key={`${file.name}-${index}`}
                        variant={selectedFileIndex === index ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedFileIndex(index)}
                      >
                        {file.name}
                      </Button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    {selectedFile ? (
                      <pre className="whitespace-pre-wrap break-words rounded-lg bg-slate-900/90 p-4 font-mono text-xs text-white">
                        {selectedFile.content}
                      </pre>
                    ) : (
                      <p className="text-sm text-muted-foreground">Select a file to inspect the generated code.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
                Generate a project by describing it in the chat input. The summary and code will appear here.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
