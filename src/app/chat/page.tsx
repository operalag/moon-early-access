'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoTrigger from '@/components/ui/InfoTrigger';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hello analyst. I am the MOON AI. Ask me about match probabilities, player stats, or historical trends for the upcoming World Cup." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, conversationId })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Server Error: ${res.status}`);
      }
      
      if (data.text) {
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.text };
        setMessages(prev => [...prev, aiMsg]);
        if (data.conversationId) setConversationId(data.conversationId);
      } else {
        throw new Error('No response text received from AI');
      }

    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: `System Error: ${error.message || "Unknown error"}. Please check API keys.` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col pb-32 relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#121212]/80 backdrop-blur-xl border-b border-white/5 p-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Bot size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-white">AI Analyst</h1>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <p className="text-[10px] text-zinc-400 font-mono">ONLINE • CHATBASE V3</p>
            </div>
          </div>
        </div>
        <InfoTrigger title="MOON Intelligence" content="Our AI is trained on thousands of historical cricket matches. Use it to refine your prediction strategy." />
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'user' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-yellow-500 text-black font-medium rounded-tr-none' 
                : 'bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles size={16} className="animate-spin text-white/50" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-24 left-4 right-4 z-40">
        <div className="bg-[#121212] border border-white/10 rounded-[24px] p-2 flex items-center gap-2 shadow-2xl shadow-black/50">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about match stats..."
            className="flex-1 bg-transparent border-none text-white placeholder-zinc-600 px-4 py-2 focus:ring-0 text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-full transition-all ${
              input.trim() 
                ? 'bg-yellow-500 text-black hover:scale-105' 
                : 'bg-white/10 text-zinc-600'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

    </main>
  );
}
