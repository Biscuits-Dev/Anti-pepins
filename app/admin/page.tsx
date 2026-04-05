'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useAdminChat } from '@/hooks/useAdminChat';
import { SENDER_ROLE, type ChatMessage, type AdminChatSession } from '@/types/chat';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadSession(session: AdminChatSession): void {
  const lines = session.messages.map((msg) => {
    const time = new Date(msg.timestamp).toLocaleString('fr-FR');
    const who = msg.sender === SENDER_ROLE.ADMIN ? 'Bénévole' : 'Visiteur';
    return `[${time}] ${who} : ${msg.text}`;
  });

  const content = [
    `Conversation — Session ${session.sessionId}`,
    `Exportée le ${new Date().toLocaleString('fr-FR')}`,
    '─'.repeat(60),
    ...lines,
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conversation-${session.sessionId.slice(0, 12)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadAllSessions(sessions: Map<string, AdminChatSession>): void {
  const sessionBlocks = Array.from(sessions.values())
    .sort((a, b) => new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime())
    .map((session) => {
      const messages = session.messages.map((msg) => {
        const time = new Date(msg.timestamp).toLocaleString('fr-FR');
        const who = msg.sender === SENDER_ROLE.ADMIN ? 'Bénévole' : 'Visiteur';
        return `[${time}] ${who} : ${msg.text}`;
      });
      return [
        `\n${'═'.repeat(60)}`,
        `Session ${session.sessionId}`,
        '═'.repeat(60),
        ...messages,
      ].join('\n');
    });

  const content = [
    `Export complet — ${sessions.size} conversation(s)`,
    `Exporté le ${new Date().toLocaleString('fr-FR')}`,
    ...sessionBlocks,
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conversations-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ConnectionBadgeProps {
  readonly isConnected: boolean;
}

function ConnectionBadge({ isConnected }: ConnectionBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
        }`}
      />
      <span className="text-xs font-medium text-slate-500">
        {isConnected ? 'Connecté' : 'Reconnexion…'}
      </span>
    </div>
  );
}

interface SessionItemProps {
  readonly session: AdminChatSession;
  readonly isActive: boolean;
  readonly onClick: (sessionId: string) => void;
  readonly onDownload: (session: AdminChatSession) => void;
}

function SessionItem({ session, isActive, onClick, onDownload }: SessionItemProps) {
  const lastMessage = session.messages.at(-1);
  const time = lastMessage
    ? new Date(lastMessage.timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const handleClick = useCallback(() => {
    onClick(session.sessionId);
  }, [onClick, session.sessionId]);

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDownload(session);
    },
    [onDownload, session]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors group ${
        isActive ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-slate-400 truncate">
          {session.sessionId.slice(0, 12)}…
        </span>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-xs text-slate-400">{time}</span>
          {session.messages.length > 0 && (
            // Bouton natif pour éviter l'erreur d'accessibilité role="button"
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Télécharger la conversation"
              className="text-slate-300 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100 leading-none"
            >
              ↓
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-700 truncate">
        {lastMessage?.text ?? 'Nouvelle conversation'}
      </p>
      {session.isUserTyping && (
        <p className="text-xs text-emerald-500 mt-1">est en train d&apos;écrire…</p>
      )}
    </button>
  );
}

interface MessageBubbleProps {
  readonly message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isAdmin = message.sender === SENDER_ROLE.ADMIN;
  const time = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-sm px-4 py-2 rounded-2xl text-sm ${
          isAdmin
            ? 'bg-emerald-600 text-white rounded-br-sm'
            : 'bg-slate-100 text-slate-900 rounded-bl-sm'
        }`}
      >
        <p className="leading-relaxed">{message.text}</p>
        <p className={`text-xs mt-1 ${isAdmin ? 'text-emerald-200' : 'text-slate-400'}`}>
          {time}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1 items-center">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }: Readonly<{ label: string }>) {
  return (
    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
      {label}
    </div>
  );
}

export default function AdminPage() {
  const [replyValue, setReplyValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    sessions,
    activeSessionId,
    isConnected,
    setActiveSession,
    replyToSession,
    notifyTyping,
    clearSessions,
  } = useAdminChat();

  const activeSession = activeSessionId ? sessions.get(activeSessionId) : undefined;
  const sessionList = Array.from(sessions.values()).sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  const sessionCountLabel = (() => {
    if (sessionList.length === 0) return 'Aucune conversation active';
    const plural = sessionList.length > 1 ? 's' : '';
    return `${sessionList.length} conversation${plural} active${plural}`;
  })();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleLogout = useCallback(async (): Promise<void> => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key is missing');
      return;
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }, [router]);

  const handleClearSessions = useCallback((): void => {
    if (confirm('Vider tout l\'historique des conversations ?')) {
      clearSessions();
    }
  }, [clearSessions]);

  const handleDownloadAll = useCallback((): void => {
    downloadAllSessions(sessions);
  }, [sessions]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      if (!activeSessionId || !replyValue.trim()) return;

      const text = replyValue.trim();
      setReplyValue('');
      await replyToSession(activeSessionId, text);
    },
    [activeSessionId, replyValue, replyToSession]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setReplyValue(e.target.value);
      if (activeSessionId) notifyTyping(activeSessionId);
    },
    [activeSessionId, notifyTyping]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.currentTarget.form?.requestSubmit();
      }
    },
    []
  );

  const handleDownloadSession = useCallback((session: AdminChatSession): void => {
    downloadSession(session);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <header className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h1 className="font-semibold text-slate-900">Anti Pepins Admin</h1>
            <ConnectionBadge isConnected={isConnected} />
          </div>
          <p className="text-sm text-slate-700 mb-6">{sessionCountLabel}</p>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {sessions.size > 0 && (
              <button
                type="button"
                onClick={handleDownloadAll}
                className="text-xs text-slate-800 bg-emerald-100 px-2 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                ↓ Tout exporter
              </button>
            )}
            {sessions.size > 0 && (
              <button
                type="button"
                onClick={handleClearSessions}
                className="text-xs text-slate-800 bg-red-100 px-2 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
              >
                Vider
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-slate-800 bg-slate-100 px-2 py-1.5 rounded-lg hover:bg-slate-200 transition-colors ml-auto"
            >
              Déconnexion
            </button>
          </div>
        </header>

        <nav aria-label="Liste des conversations" className="flex-1 overflow-y-auto">
          {sessionList.length === 0 ? (
            <EmptyState label="En attente de visiteurs…" />
          ) : (
            sessionList.map((session) => (
              <SessionItem
                key={session.sessionId}
                session={session}
                isActive={session.sessionId === activeSessionId}
                onClick={setActiveSession}
                onDownload={handleDownloadSession}
              />
            ))
          )}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeSession ? (
          <>
            <header className="px-6 py-4 bg-white border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-slate-400">
                    Session {activeSession.sessionId}
                  </p>
                  {activeSession.isUserTyping && (
                    <p className="text-xs text-emerald-500 mt-0.5">
                      L&apos;utilisateur est en train d&apos;écrire…
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">
                    {activeSession.messages.length} message
                    {activeSession.messages.length > 1 ? 's' : ''}
                  </span>
                  {activeSession.messages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => downloadSession(activeSession)}
                      className="text-xs text-slate-800 bg-slate-100 px-2 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      ↓ Exporter
                    </button>
                  )}
                </div>
              </div>
            </header>

            <div
              role="log"
              aria-live="polite"
              aria-label="Messages de la conversation"
              className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
            >
              {activeSession.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {activeSession.isUserTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-3" noValidate>
                <textarea
                  value={replyValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Répondre… (Entrée pour envoyer, Maj+Entrée pour sauter une ligne)"
                  maxLength={2000}
                  rows={2}
                  aria-label="Réponse"
                  className="flex-1 px-3 py-2 border  border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 text-sm placeholder:text-slate-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!replyValue.trim()}
                  aria-label="Envoyer la réponse"
                  className="px-5 py-2 bg-emerald-600 text-white text-gray-800 rounded-xl hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors self-end"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </>
        ) : (
          <EmptyState label="Sélectionnez une conversation pour répondre" />
        )}
      </main>
    </div>
  );
}