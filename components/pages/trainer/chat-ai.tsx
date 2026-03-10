'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatMessage, ChatSession, useChatSocket } from '@/hooks/use-chat-socket';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { IChatSession } from '@/types/chat-sessions/chat-session.type';
import SessionEvaluation from '@/components/modules/session-evaluation';

interface ChatAiProps {
  scenarioId: string;
  scenarioTitle: string;
  setIsChatReady: (isChatReady: boolean) => void;
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
}) {
  const isUser = message.role === 'user';
  return (
    <div
      className={cn(
        'flex gap-3 w-full max-w-[85%]',
        isUser && 'ml-auto flex-row-reverse'
      )}
    >
      {!isUser && (
        <Avatar className="size-8 shrink-0 rounded-full bg-muted">
          <AvatarFallback className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
            AI
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'rounded-2xl px-4 py-2.5 text-sm shadow-sm',
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-muted/80 text-foreground rounded-bl-md border border-border/50'
        )}
      >
        <p className="whitespace-pre-wrap wrap-break-word">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-0.5 bg-current animate-pulse align-middle" />
          )}
        </p>
      </div>
    </div>
  );
}

export default function ChatAi({ scenarioId, scenarioTitle, setIsChatReady }: ChatAiProps) {
  const [inputText, setInputText] = useState('');
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState<boolean>(false);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [sessionEvaluation, setSessionEvaluation] = useState<IChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { connected, streamingContent, joinSession, sendMessage, disconnect, evaluateSession } = useChatSocket({
    onJoined: (s) => {
      setSession(s);
      setMessages(s.messages ?? []);
    },
    onReply: (msg) => {
      setMessages((prev) => [...prev, msg]);
    },
    onError: (msg) => alert(msg),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: '', role: 'user', content: text, createdAt: '' },
    ]);
    sendMessage(text);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  async function evaluateSimulation() {
    setIsLoadingEvaluation(true);
    setIsOpenDialog(true)
    try {
      disconnect();
      const data: IChatSession = await evaluateSession(session?.id || '');
      setSessionEvaluation(data)
    } catch (error) {
      console.error('Error finishing simulation:', error);
    } finally {
      setIsLoadingEvaluation(false);
    }
  }

  useEffect(() => {
    joinSession(scenarioId);
  }, [scenarioId]);

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <Card className="w-full h-full p-0 gap-0 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 w-full p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-center justify-between bg-card">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-muted-foreground text-sm shrink-0">Scenario:</span>
            <p className="font-semibold truncate">{scenarioTitle}</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {connected ? (
              <span className="text-xs text-emerald-600 flex items-center gap-1.5 shrink-0">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            ) : session ? (
              <span className="text-xs text-amber-600 flex items-center gap-1.5 shrink-0">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Disconnected
              </span>
            ) : (
              <span className="text-xs text-muted-foreground shrink-0">
                Connecting…
              </span>
            )}
            <Button
              variant="danger"
              size="sm"
              className="w-full sm:w-auto shrink-0"
              onClick={evaluateSimulation}
            >
              End Simulation
            </Button>
          </div>
        </div>

        {/* Messages */}
        <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
          <div
            ref={listRef}
            className="h-full overflow-y-auto overflow-x-hidden p-4 space-y-4 scroll-smooth"
          >
            {messages.length === 0 && !streamingContent && (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center text-muted-foreground">
                <p className="text-sm">Start the conversation. The AI will respond with streaming (chunks).</p>
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id || `${m.role}-${m.content.slice(0, 20)}`} message={m} />
            ))}
            {streamingContent && (
              <MessageBubble
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingContent,
                  createdAt: '',
                }}
                isStreaming
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {/* Input */}
        <CardFooter className="shrink-0 p-4 pt-3 border-t border-border bg-card rounded-b-xl">
          <div className="w-full flex gap-2 items-end">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
              className="min-h-[44px] max-h-[120px] resize-none py-3"
              rows={1}
              disabled={!connected}
            />
            <Button
              size="lg"
              className="shrink-0 h-[44px]"
              disabled={!inputText.trim() || !connected}
              onClick={handleSend}
            >
              Send
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Dialog open={isOpenDialog} onOpenChange={() => {
        if (!isLoadingEvaluation) {
          setIsOpenDialog(false);
          setSessionEvaluation(null);
          setIsChatReady(false);
        }
      }}>
        <DialogContent className="max-h-[90vh] max-w-[500px] w-full overflow-y-scroll p-4">
          <VisuallyHidden>
            <DialogTitle>
              Evaluation in progress, please wait...
            </DialogTitle>
          </VisuallyHidden>
          {isLoadingEvaluation && sessionEvaluation !== null ? (
            <div className="w-full h-[200px] flex flex-col gap-2 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Evaluating...</span>
            </div>
          ) : null}

          {sessionEvaluation !== null ? (
            <SessionEvaluation session={sessionEvaluation}/>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
