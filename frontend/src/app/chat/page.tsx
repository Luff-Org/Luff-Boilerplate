'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useTheme } from '@/context/ThemeContext';
import { askAi, uploadAiPdf } from '@/lib/api';
import { 
  Send, 
  Bot, 
  User, 
  Upload, 
  Loader2, 
  FileText,
  Sparkles,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I am your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'generic' | 'rag'>('generic');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { reply } = await askAi(userMessage, mode);
      setMessages((prev) => [...prev, { role: 'ai', content: reply }]);
    } catch (error) {
      toast.error('AI failed to respond. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Processing PDF and indexing knowledge...');

    try {
      await uploadAiPdf(file);
      toast.success('PDF indexed! You can now use RAG mode to ask questions about it.', { id: toastId });
      setMode('rag');
    } catch (error) {
      toast.error('Failed to process PDF.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className={`flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto rounded-[2rem] border shadow-2xl overflow-hidden mt-6 transition-all duration-500 ${isDark ? 'bg-[#17191E] border-gray-800 shadow-indigo-500/5' : 'bg-white border-gray-100 shadow-gray-100'}`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b flex items-center justify-between transition-colors ${isDark ? 'bg-black/20 border-gray-800' : 'bg-gray-50/50 border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Assistant</h1>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Gemini 2.5 Flash • Upstash Vector</p>
            </div>
          </div>

          <div className={`flex items-center gap-2 p-1.5 rounded-xl border transition-colors ${isDark ? 'bg-black/40 border-gray-800' : 'bg-white border-gray-100'}`}>
            <button
              onClick={() => setMode('generic')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'generic' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : `text-gray-500 hover:text-indigo-400`
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Generic
            </button>
            <button
              onClick={() => setMode('rag')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'rag' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : `text-gray-500 hover:text-indigo-400`
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              RAG
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-600' : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
              </div>
              <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm font-bold leading-relaxed transition-all shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10' 
                  : isDark ? 'bg-black/30 border border-gray-800 text-gray-200 rounded-tl-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                <Bot className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <div className={`px-5 py-3 rounded-2xl rounded-tl-none shadow-sm ${isDark ? 'bg-black/30 border border-gray-800' : 'bg-white border-gray-100'}`}>
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`p-6 border-t transition-colors ${isDark ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-100'}`}>
          {mode === 'rag' && (
            <div className={`mb-4 flex items-center justify-between p-3 rounded-xl border transition-colors ${isDark ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50/50 border-indigo-100'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-500" />
                </div>
                <span className={`font-black uppercase tracking-widest text-[9px] ${isDark ? 'text-indigo-400' : 'text-indigo-900'}`}>Knowledge Engine Active</span>
              </div>
              <label className="cursor-pointer group">
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
                  <Upload className="w-3 h-3" />
                  Sync (PDF)
                </div>
              </label>
            </div>
          )}

          <form onSubmit={handleSend} className="relative flex items-center gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'generic' ? "Send a message..." : "Ask questions about your documents..."}
              className={`flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all border shadow-inner ${isDark ? 'bg-[#0F1115] border-gray-800 text-white placeholder-gray-600 focus:ring-indigo-500/20' : 'bg-gray-50 border-stone-100 text-gray-900 placeholder-gray-400 focus:ring-indigo-500/5'}`}
            />
            <button
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className={`mt-4 text-center text-[9px] font-black uppercase tracking-[0.2em] opacity-30 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Mastermonorepo Architecture AI 
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
