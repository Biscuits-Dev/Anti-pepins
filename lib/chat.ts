import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import {
  BROADCAST_EVENT,
  SENDER_ROLE,
  PRESENCE_STATUS,
  isChatMessage,
  isTypingPayload,
  type ChatMessage,
  type SenderRole,
} from '@/types/chat';

const CHANNEL_PREFIX = 'chat:session:';
const ADMIN_CHANNEL = 'chat:admin';
const ADMIN_PRESENCE_CHANNEL = 'chat:admin-presence';


function sessionChannelName(sessionId: string): string {
  return `${CHANNEL_PREFIX}${sessionId}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createSessionChannel(sessionId: string): RealtimeChannel {
  return supabase.channel(sessionChannelName(sessionId), {
    config: { broadcast: { self: false } },
  });
}

export function createAdminChannel(): RealtimeChannel {
  return supabase.channel(ADMIN_CHANNEL, {
    config: { broadcast: { self: false } },
  });
}

export function createAdminPresenceChannel(): RealtimeChannel {
  return supabase.channel(ADMIN_PRESENCE_CHANNEL);
}

async function forwardToAdminChannel(
  event: string,
  payload: unknown
): Promise<void> {
  const adminChannel = supabase.channel(ADMIN_CHANNEL, {
    config: { broadcast: { self: false } },
  });

  await new Promise<void>((resolve) => {
    adminChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') resolve();
    });
  });

  await adminChannel.send({
    type: 'broadcast',
    event,
    payload,
  });

  await adminChannel.unsubscribe();
}

export async function broadcastMessage(
  channel: RealtimeChannel,
  params: {
    sessionId: string;
    text: string;
    sender: SenderRole;
  }
): Promise<ChatMessage> {
  const message: ChatMessage = {
    id: generateId(),
    sessionId: params.sessionId,
    text: params.text.trim(),
    sender: params.sender,
    timestamp: nowIso(),
  };

  // Envoie sur le canal de session
  await channel.send({
    type: 'broadcast',
    event: BROADCAST_EVENT.MESSAGE,
    payload: message,
  });

  if (params.sender === SENDER_ROLE.USER) {
    await forwardToAdminChannel(BROADCAST_EVENT.MESSAGE, message);
  }

  return message;
}

export async function broadcastTyping(
  channel: RealtimeChannel,
  params: { sessionId: string; sender: SenderRole; isTyping: boolean }
): Promise<void> {
  const payload = {
    sessionId: params.sessionId,
    sender: params.sender,
    isTyping: params.isTyping,
  };

  await channel.send({
    type: 'broadcast',
    event: BROADCAST_EVENT.TYPING,
    payload,
  });

  if (params.sender === SENDER_ROLE.USER) {
    await forwardToAdminChannel(BROADCAST_EVENT.TYPING, payload);
  }
}

export async function broadcastPresence(
  channel: RealtimeChannel,
  sender: SenderRole,
  status: typeof PRESENCE_STATUS[keyof typeof PRESENCE_STATUS]
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: BROADCAST_EVENT.PRESENCE,
    payload: { sender, status },
  });
}

export interface ChatChannelCallbacks {
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (sessionId: string, sender: SenderRole, isTyping: boolean) => void;
}

export function attachChatListeners(
  channel: RealtimeChannel,
  callbacks: ChatChannelCallbacks
): RealtimeChannel {
  return channel
    .on('broadcast', { event: BROADCAST_EVENT.MESSAGE }, ({ payload }: { payload: unknown }) => {
      if (isChatMessage(payload) && callbacks.onMessage) {
        callbacks.onMessage(payload);
      }
    })
    .on('broadcast', { event: BROADCAST_EVENT.TYPING }, ({ payload }: { payload: unknown }) => {
      if (isTypingPayload(payload) && callbacks.onTyping) {
        callbacks.onTyping(payload.sessionId, payload.sender, payload.isTyping);
      }
    })
    ;
}

const SESSION_STORAGE_KEY = 'chat_session_id';

export function getOrCreateSessionId(): string {
  if (globalThis.window === undefined) return generateId();

  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (stored) return stored;

  const newId = generateId();
  localStorage.setItem(SESSION_STORAGE_KEY, newId);
  return newId;
}

export function clearSessionId(): void {
  if (globalThis.window !== undefined) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}