import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const BACKEND_URL: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type ChatSession = {
  id: string;
  scenarioId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

type UseChatSocketOptions = {
  onJoined?: (session: ChatSession) => void;
  onChunk?: (content: string) => void;
  onReply?: (message: ChatMessage) => void;
  onError?: (message: string) => void;
};

export function useChatSocket({
  onJoined,
  onChunk,
  onReply,
  onError,
}: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const callbacksRef = useRef({ onJoined, onChunk, onReply, onError });
  callbacksRef.current = { onJoined, onChunk, onReply, onError };

  useEffect(() => {
    const token = Cookies.get('accessToken');

    if (!token) return;

    const socket = io(`${BACKEND_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => {
      setConnected(false);
      setStreamingContent('');
    });

    socket.on('chat:joined', (data: { session: ChatSession }) => {
      callbacksRef.current.onJoined?.(data.session);
    });

    socket.on('chat:chunk', (data: { content: string }) => {
      setStreamingContent((prev) => prev + data.content);
      callbacksRef.current.onChunk?.(data.content);
    });

    socket.on('chat:reply', (data: { message: ChatMessage }) => {
      setStreamingContent('');
      callbacksRef.current.onReply?.(data.message);
    });

    socket.on('chat:error', (data: { message: string }) => {
      setStreamingContent('');
      callbacksRef.current.onError?.(data.message);
    });

    socketRef.current = socket;
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat:joined');
      socket.off('chat:chunk');
      socket.off('chat:reply');
      socket.off('chat:error');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinSession = useCallback((scenarioId: string) => {
    socketRef.current?.emit('chat:join', { scenarioId });
  }, []);

  const sendMessage = useCallback((content: string) => {
    socketRef.current?.emit('chat:message', { content });
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setConnected(false);
      setStreamingContent('');
    }
  }, []);

  return {
    connected,
    streamingContent,
    joinSession,
    sendMessage,
    disconnect,
  };
}
