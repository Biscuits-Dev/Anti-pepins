export const SENDER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const BROADCAST_EVENT = {
  MESSAGE: 'chat:message',
  TYPING: 'chat:typing',
  PRESENCE: 'chat:presence',
} as const;

export const PRESENCE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
} as const;

export type SenderRole = (typeof SENDER_ROLE)[keyof typeof SENDER_ROLE];
export type BroadcastEvent = (typeof BROADCAST_EVENT)[keyof typeof BROADCAST_EVENT];
export type PresenceStatus = (typeof PRESENCE_STATUS)[keyof typeof PRESENCE_STATUS];

export interface ChatMessage {
  readonly id: string;
  readonly sessionId: string;
  readonly text: string;
  readonly sender: SenderRole;
  readonly timestamp: string; // ISO 8601
}

export interface TypingPayload {
  readonly sessionId: string;
  readonly sender: SenderRole;
  readonly isTyping: boolean;
}

export interface PresencePayload {
  readonly status: PresenceStatus;
  readonly sender: SenderRole;
}

export interface BroadcastMessagePayload {
  readonly event: typeof BROADCAST_EVENT.MESSAGE;
  readonly payload: ChatMessage;
}

export interface BroadcastTypingPayload {
  readonly event: typeof BROADCAST_EVENT.TYPING;
  readonly payload: TypingPayload;
}

export interface BroadcastPresencePayload {
  readonly event: typeof BROADCAST_EVENT.PRESENCE;
  readonly payload: PresencePayload;
}

export type BroadcastPayload =
  | BroadcastMessagePayload
  | BroadcastTypingPayload
  | BroadcastPresencePayload;

export interface ChatState {
  readonly messages: ChatMessage[];
  readonly isAdminTyping: boolean;
  readonly isAdminOnline: boolean;
  readonly isConnected: boolean;
}

export interface AdminChatSession {
  readonly sessionId: string;
  readonly messages: ChatMessage[];
  readonly isUserTyping: boolean;
  readonly lastActivity: string; // ISO 8601
}


function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isSenderRole(value: unknown): value is SenderRole {
  return value === SENDER_ROLE.USER || value === SENDER_ROLE.ADMIN;
}

export function isChatMessage(value: unknown): value is ChatMessage {
  if (!isRecord(value)) return false;

  return (
    typeof value['id'] === 'string' &&
    typeof value['sessionId'] === 'string' &&
    typeof value['text'] === 'string' &&
    typeof value['timestamp'] === 'string' &&
    isSenderRole(value['sender'])
  );
}

export function isTypingPayload(value: unknown): value is TypingPayload {
  if (!isRecord(value)) return false;

  return (
    typeof value['sessionId'] === 'string' &&
    typeof value['isTyping'] === 'boolean' &&
    isSenderRole(value['sender'])
  );
}

export function isPresencePayload(value: unknown): value is PresencePayload {
  if (!isRecord(value)) return false;

  return (
    isSenderRole(value['sender']) &&
    (value['status'] === PRESENCE_STATUS.ONLINE ||
      value['status'] === PRESENCE_STATUS.OFFLINE)
  );
}