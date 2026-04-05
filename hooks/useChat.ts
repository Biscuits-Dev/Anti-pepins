'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  SENDER_ROLE,
  PRESENCE_STATUS,
  isChatMessage,
  type ChatMessage,
  type ChatState,
} from '@/types/chat';
import {
  createSessionChannel,
  createAdminPresenceChannel,
  attachChatListeners,
  broadcastMessage,
  broadcastTyping,
  getOrCreateSessionId,
} from '@/lib/chat';

const TYPING_DEBOUNCE_MS = 1_000;
const TYPING_STOP_DELAY_MS = 2_000;

function appendAdminMessage(prev: ChatState, message: ChatMessage): ChatState {
  if (prev.messages.some(m => m.id === message.id)) return prev;
  return { ...prev, messages: [...prev.messages, message], isAdminTyping: false };
}

export interface UseChatReturn extends ChatState {
  sessionId: string;
  sendMessage: (text: string) => Promise<void>;
  notifyTyping: () => void;
}

async function fetchSessionHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`/api/chat/session/${encodeURIComponent(sessionId)}`);
    if (!res.ok) return [];
    const body: unknown = await res.json();
    if (
      typeof body !== 'object' || body === null ||
      !Array.isArray((body as Record<string, unknown>).messages)
    ) return [];
    return ((body as { messages: unknown[] }).messages).filter(isChatMessage);
  } catch {
    return [];
  }
}

export function useChat(): UseChatReturn {
  const [sessionId] = useState<string>(getOrCreateSessionId);

  const [state, setState] = useState<ChatState>({
    messages: [],
    isAdminTyping: false,
    isAdminOnline: false,
    isConnected: false,
  });

  // Chargement de l'historique au montage
  useEffect(() => {
    fetchSessionHistory(sessionId).then(history => {
      if (history.length > 0) {
        setState(prev => ({ ...prev, messages: history }));
      }
    });
  }, [sessionId]);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingSentRef = useRef<boolean>(false);

  useEffect(() => {
    const channel = createSessionChannel(sessionId);

    attachChatListeners(channel, {
      onMessage(message) {
        if (message.sender === SENDER_ROLE.ADMIN) {
          setState(prev => appendAdminMessage(prev, message));
        }
      },
      onTyping(_sessionId, sender, isTyping) {
        if (sender === SENDER_ROLE.ADMIN) {
          setState(prev => ({ ...prev, isAdminTyping: isTyping }));
        }
      },
    });

    channel.subscribe((status) => {
      setState(prev => ({ ...prev, isConnected: status === 'SUBSCRIBED' }));
    });

    channelRef.current = channel;

    const typingTimeout = typingTimeoutRef.current;
    const typingDebounce = typingDebounceRef.current;

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      if (typingDebounce) clearTimeout(typingDebounce);
      channel.unsubscribe();
    };
  }, [sessionId]);

  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!channelRef.current || !text.trim()) return;

    if (isTypingSentRef.current) {
      isTypingSentRef.current = false;
      await broadcastTyping(channelRef.current, {
        sessionId,
        sender: SENDER_ROLE.USER,
        isTyping: false,
      });
    }

    const message = await broadcastMessage(channelRef.current, {
      sessionId,
      text,
      sender: SENDER_ROLE.USER,
    });

    // Persistance côté serveur (service_role, invisible des clients anonymes)
    fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    }).catch(err => console.error('[useChat] Erreur persistance:', err));

    setState(prev => ({ ...prev, messages: [...prev.messages, message] }));
  }, [sessionId]);

  // Présence admin via Supabase Presence (state maintenu côté serveur, synchro au late-join)
  useEffect(() => {
    const presenceChannel = createAdminPresenceChannel();

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState<{ sender: string; status: string }>();
        const isOnline = Object.values(state).some(presences =>
          presences.some(p => p.sender === SENDER_ROLE.ADMIN && p.status === PRESENCE_STATUS.ONLINE)
        );
        setState(prev => ({ ...prev, isAdminOnline: isOnline }));
      })
      .on('presence', { event: 'join' }, ({ newPresences }: { newPresences: { sender: string }[] }) => {
        if (newPresences.some(p => p.sender === SENDER_ROLE.ADMIN)) {
          setState(prev => ({ ...prev, isAdminOnline: true }));
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: { leftPresences: { sender: string }[] }) => {
        if (leftPresences.some(p => p.sender === SENDER_ROLE.ADMIN)) {
          setState(prev => ({ ...prev, isAdminOnline: false }));
        }
      });

    presenceChannel.subscribe();
    return () => { presenceChannel.unsubscribe(); };
  }, []);

  const notifyTyping = useCallback((): void => {
    if (!channelRef.current) return;

    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);

    typingDebounceRef.current = setTimeout(async () => {
      if (!channelRef.current) return;

      if (!isTypingSentRef.current) {
        isTypingSentRef.current = true;
        await broadcastTyping(channelRef.current, {
          sessionId,
          sender: SENDER_ROLE.USER,
          isTyping: true,
        });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(async () => {
        if (!channelRef.current || !isTypingSentRef.current) return;
        isTypingSentRef.current = false;
        await broadcastTyping(channelRef.current, {
          sessionId,
          sender: SENDER_ROLE.USER,
          isTyping: false,
        });
      }, TYPING_STOP_DELAY_MS);
    }, TYPING_DEBOUNCE_MS);
  }, [sessionId]);

  return {
    ...state,
    sessionId,
    sendMessage,
    notifyTyping,
  };
}