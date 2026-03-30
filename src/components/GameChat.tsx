'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from './AuthProvider';
import { useChat } from '@/hooks/useChat';
import { sendMessage } from '@/lib/chatService';

interface GameChatProps {
  gameId: string;
}

export default function GameChat({ gameId }: GameChatProps) {
  const { user } = useAuthContext();
  const { messages } = useChat(gameId);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!user || !text.trim()) return;
    const msg = text.trim();
    setText('');
    try {
      await sendMessage(gameId, user, msg);
    } catch (error) {
      console.error('Mesaj gonderme hatasi:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col rounded-xl bg-gray-800 border border-gray-700 h-full max-h-[500px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white">Sohbet</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-xs text-center py-4">
            Henuz mesaj yok
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.uid === user?.uid
                  ? 'bg-emerald-600/20 ml-4'
                  : 'bg-gray-700/50 mr-4'
              }`}
            >
              <p className="text-xs font-semibold text-emerald-400 mb-0.5">
                {msg.name}
              </p>
              <p className="text-gray-200 break-words">{msg.text}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesaj yaz..."
            maxLength={500}
            className="flex-1 rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Gonder
          </button>
        </div>
      </div>
    </div>
  );
}
