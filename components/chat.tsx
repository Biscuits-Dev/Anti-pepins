'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatWidget(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isAdminTyping,
    isAdminOnline,
    isConnected,
    sendMessage,
    notifyTyping,
  } = useChat();

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage(message);
    setMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    notifyTyping();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all z-40"
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        <span className="text-2xl">💬</span>
        {isAdminOnline && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-40"
          >
            <div className="flex flex-col h-96 max-h-[60vh]">
              {/* Header */}
              <div className="bg-emerald-600 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="font-semibold text-sm">Chat Anti Pepins</h3>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <button
                    onClick={toggleChat}
                    className="text-white hover:text-emerald-100 transition-colors"
                    aria-label="Fermer le chat"
                  >
                    <span className="text-lg">×</span>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {!isAdminOnline && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-6">
                    <span className="text-3xl">😴</span>
                    <p className="text-slate-700 text-sm font-medium">Aucun bénévole disponible</p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Tous nos bénévoles sont absents pour le moment.<br />
                      Revenez plus tard, nous ferons de notre mieux pour vous répondre rapidement.
                    </p>
                  </div>
                ) : (
                  <>
                    {!isAdminOnline && messages.length > 0 && (
                      <div className="text-center text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        Aucun bénévole connecté pour le moment — revenez plus tard.
                      </div>
                    )}
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          msg.sender === 'admin'
                            ? 'bg-emerald-100 text-emerald-900 rounded-br-sm'
                            : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                        }`}>
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === 'admin' ? 'text-emerald-600' : 'text-slate-400'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isAdminTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 px-3 py-2 rounded-lg rounded-bl-sm">
                          <div className="flex gap-1 items-center">
                            {[0, 150, 300].map(delay => (
                              <span
                                key={delay}
                                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${delay}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {isAdminOnline ? (
                <form onSubmit={handleSubmit} className="border-t border-slate-100 p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={handleInputChange}
                      placeholder="Votre message..."
                      className="flex-1 px-3 py-2 border text-gray-900 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      disabled={!isConnected}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || !isConnected}
                      className="px-4 pl-2 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Envoyer
                    </button>
                  </div>
                </form>
              ) : (
                <div className="border-t border-slate-100 px-4 py-3 text-center text-xs text-slate-400">
                  Le formulaire sera disponible quand un bénévole sera connecté.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}