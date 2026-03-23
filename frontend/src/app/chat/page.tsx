'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { askAi, uploadAiPdf } from '@/lib/api';
import { 
  Send, 
  Bot, 
  User, 
  Upload, 
  Settings2, 
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
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto bg-white/50 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden mt-8">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Bot className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-sm text-gray-500">Powered by GPT-4o & Upstash</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <button
              onClick={() => setMode('generic')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === 'generic' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              Generic
            </button>
            <button
              onClick={() => setMode('rag')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === 'rag' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              RAG Mode
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
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-100 border border-gray-200'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className={`max-w-[80%] px-5 py-4 rounded-2xl text-[15px] leading-relaxed transition-all ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-gray-600" />
              </div>
              <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-100">
          {mode === 'rag' && (
            <div className="mb-4 flex items-center justify-between p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-indigo-900">Contextual RAG Active</span>
              </div>
              <label className="cursor-pointer group">
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Knowledge (PDF)
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
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
            />
            <button
              disabled={isLoading || !input.trim()}
              className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-93 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          <p className="mt-4 text-center text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
