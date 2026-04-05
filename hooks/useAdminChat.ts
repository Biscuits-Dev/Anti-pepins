'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import {
  SENDER_ROLE,
  PRESENCE_STATUS,
  type AdminChatSession,
  type ChatMessage,
} from '@/types/chat';
import {
  createAdminChannel,
  createAdminPresenceChannel,
  createSessionChannel,
  attachChatListeners,
  broadcastMessage,
  broadcastTyping,
} from '@/lib/chat';

const TYPING_STOP_DELAY_MS = 2_500;

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function fetchAllMessages(): Promise<Map<string, AdminChatSession>> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('timestamp', { ascending: true });

  if (error || !data) {
    console.error('[useAdminChat] Erreur chargement messages:', error);
    return new Map();
  }

  const map = new Map<string, AdminChatSession>();
  for (const row of data) {
    const msg: ChatMessage = {
      id: row.id,
      sessionId: row.session_id,
      text: row.text,
      sender: row.sender,
      timestamp: row.timestamp,
    };

    const existing = map.get(row.session_id);
    map.set(row.session_id, {
      sessionId: row.session_id,
      messages: existing ? [...existing.messages, msg] : [msg],
      isUserTyping: false,
      lastActivity: row.timestamp, // le dernier row écrase, c'est correct car ORDER BY timestamp ASC
    });
  }
  return map;
}

async function persistMessage(message: ChatMessage): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('chat_messages').insert({
    id: message.id,
    session_id: message.sessionId,
    text: message.text,
    sender: message.sender,
    timestamp: message.timestamp,
  });
  if (error) console.error('[useAdminChat] Erreur persistance:', error);
}

async function deleteAllMessages(): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) console.error('[useAdminChat] Erreur suppression:', error);
}

export interface UseAdminChatReturn {
  readonly sessions: Map<string, AdminChatSession>;
  readonly activeSessionId: string | null;
  readonly isConnected: boolean;
  readonly isLoading: boolean;
  setActiveSession: (sessionId: string) => void;
  replyToSession: (sessionId: string, text: string) => Promise<void>;
  notifyTyping: (sessionId: string) => void;
  clearSessions: () => void;
}

export function useAdminChat(): UseAdminChatReturn {
  const [sessions, setSessions] = useState<Map<string, AdminChatSession>>(new Map());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const replyChannelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
  const adminChannelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const isTypingSentRef = useRef<Map<string, boolean>>(new Map());

  const upsertSession = useCallback(
    (sessionId: string, updater: (prev: AdminChatSession) => AdminChatSession): void => {
      setSessions(prev => {
        const next = new Map(prev);
        const existing = next.get(sessionId) ?? {
          sessionId,
          messages: [],
          isUserTyping: false,
          lastActivity: new Date().toISOString(),
        };
        next.set(sessionId, updater(existing));
        return next;
      });
    },
    []
  );

  const ensureReplyChannel = useCallback((sessionId: string): RealtimeChannel => {
    const existing = replyChannelsRef.current.get(sessionId);
    if (existing) return existing;
    const channel = createSessionChannel(sessionId);
    channel.subscribe();
    replyChannelsRef.current.set(sessionId, channel);
    return channel;
  }, []);

  const clearSessions = useCallback((): void => {
    deleteAllMessages().then(() => {
      setSessions(new Map());
      setActiveSessionId(null);
    });
  }, []);

  // Chargement initial depuis Supabase
  useEffect(() => {
    fetchAllMessages().then(initialSessions => {
      setSessions(initialSessions);
      for (const sessionId of initialSessions.keys()) {
        ensureReplyChannel(sessionId);
      }
      setIsLoading(false);
    });
  }, [ensureReplyChannel]);

  useEffect(() => {
    const adminChannel = createAdminChannel();

    attachChatListeners(adminChannel, {
      onMessage(message) {
        if (message.sender === SENDER_ROLE.USER) {
          ensureReplyChannel(message.sessionId);
          // La persistance des messages user est gérée par /api/chat/message (service_role)
          upsertSession(message.sessionId, prev => ({
            ...prev,
            messages: [...prev.messages, message],
            lastActivity: message.timestamp,
            isUserTyping: false,
          }));
        }
      },
      onTyping(sessionId, sender, isTyping) {
        if (sender === SENDER_ROLE.USER) {
          upsertSession(sessionId, prev => ({ ...prev, isUserTyping: isTyping }));
        }
      },
    });

    adminChannel.subscribe(status => {
      setIsConnected(status === 'SUBSCRIBED');
    });

    adminChannelRef.current = adminChannel;

    // Présence admin via Supabase Presence (state maintenu côté serveur)
    const presenceChannel = createAdminPresenceChannel();
    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({ sender: SENDER_ROLE.ADMIN, status: PRESENCE_STATUS.ONLINE });
      }
    });

    const typingTimeouts = typingTimeoutsRef.current;
    const replyChannels = replyChannelsRef.current;

    return () => {
      presenceChannel.untrack().catch(console.error);
      presenceChannel.unsubscribe().catch(console.error);
      typingTimeouts.forEach(clearTimeout);
      replyChannels.forEach(ch => { ch.unsubscribe().catch(console.error); });
      adminChannel.unsubscribe().catch(console.error);
    };
  }, [ensureReplyChannel, upsertSession]);

  const replyToSession = useCallback(
    async (sessionId: string, text: string): Promise<void> => {
      if (!text.trim()) return;
      const channel = ensureReplyChannel(sessionId);

      if (isTypingSentRef.current.get(sessionId)) {
        isTypingSentRef.current.set(sessionId, false);
        await broadcastTyping(channel, { sessionId, sender: SENDER_ROLE.ADMIN, isTyping: false });
      }

      const message = await broadcastMessage(channel, { sessionId, text, sender: SENDER_ROLE.ADMIN });
      await persistMessage(message);

      upsertSession(sessionId, prev => ({
        ...prev,
        messages: [...prev.messages, message],
        lastActivity: message.timestamp,
      }));
    },
    [ensureReplyChannel, upsertSession]
  );

  const notifyTyping = useCallback(
    (sessionId: string): void => {
      const channel = ensureReplyChannel(sessionId);

      const sendTypingStop = async (): Promise<void> => {
        if (!isTypingSentRef.current.get(sessionId)) return;
        isTypingSentRef.current.set(sessionId, false);
        await broadcastTyping(channel, { sessionId, sender: SENDER_ROLE.ADMIN, isTyping: false });
      };

      const existing = typingTimeoutsRef.current.get(sessionId);
      if (existing) clearTimeout(existing);

      if (!isTypingSentRef.current.get(sessionId)) {
        isTypingSentRef.current.set(sessionId, true);
        broadcastTyping(channel, { sessionId, sender: SENDER_ROLE.ADMIN, isTyping: true }).catch(console.error);
      }

      typingTimeoutsRef.current.set(
        sessionId,
        setTimeout(() => sendTypingStop().catch(console.error), TYPING_STOP_DELAY_MS)
      );
    },
    [ensureReplyChannel]
  );

  return {
    sessions,
    activeSessionId,
    isConnected,
    isLoading,
    setActiveSession: setActiveSessionId,
    replyToSession,
    notifyTyping,
    clearSessions,
  };
}