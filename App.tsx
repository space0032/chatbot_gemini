import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { Send, Loader2, Sparkles, Terminal, Info } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Header } from './components/Header';
import { MessageBubble } from './components/MessageBubble';
import { createChatSession, sendMessageStream } from './services/geminiService';
import { Message } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to store the chat session so it persists across renders without triggering re-renders
  const chatSessionRef = useRef<Chat | null>(null);
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session on Mount
  useEffect(() => {
    try {
      chatSessionRef.current = createChatSession();
      
      // Add initial welcome message
      const welcomeMessage: Message = {
        id: 'init-1',
        role: 'model',
        content: "Hello! 👋 I'm the GDSC Gemini Assistant.\n\nAsk me anything about Google technologies, coding, or upcoming club events!",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch (err) {
      console.error("Failed to initialize chat:", err);
      setError("Failed to connect to Gemini services.");
    }
  }, []);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputText.trim() || isLoading || !chatSessionRef.current) return;

    const userMessageContent = inputText.trim();
    setInputText('');
    setError(null);
    setIsLoading(true);

    // 1. Add User Message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: userMessageContent,
      timestamp: new Date(),
    };

    // 2. Add Placeholder Bot Message (Empty content initially)
    const botMessageId = uuidv4();
    const botMessage: Message = {
      id: botMessageId,
      role: 'model',
      content: '', // Will be filled by stream
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMessage, botMessage]);

    try {
      // 3. Start Streaming
      const stream = await sendMessageStream(chatSessionRef.current, userMessageContent);
      
      let fullContent = '';

      for await (const chunk of stream) {
        // Safe casting based on SDK usage
        const responseChunk = chunk as GenerateContentResponse;
        const text = responseChunk.text;
        
        if (text) {
          fullContent += text;
          
          // Update the specific bot message in state with new content
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, content: fullContent } 
              : msg
          ));
        }
      }

      // 4. Finalize
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));

    } catch (err) {
      console.error("Error during chat:", err);
      setError("Something went wrong. Please try again.");
      
      // Remove the empty bot message if it failed completely
      setMessages(prev => prev.filter(msg => msg.id !== botMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  // Allow Enter key to send (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          
          {/* Messages List */}
          <div className="flex-1 space-y-2">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {/* Loading Indicator (if processing but no stream yet) */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
               <div className="flex w-full mb-6 justify-start">
                 <div className="flex max-w-[85%] gap-3 flex-row">
                   <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm bg-white border border-slate-200">
                      <Sparkles size={20} className="text-[#DB4437] animate-pulse" />
                   </div>
                   <div className="flex items-center p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm">
                      <div className="gdsc-loader">
                        <div></div><div></div><div></div>
                      </div>
                   </div>
                 </div>
               </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="mx-auto my-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm max-w-md animate-fade-in">
                <Info size={16} />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>

        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={handleSendMessage}
            className="relative flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm"
          >
            <div className="pb-1 text-slate-400">
              <Terminal size={20} />
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about GDSC events, Android, Web..."
              className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[24px] py-1 text-slate-800 placeholder:text-slate-400"
              rows={1}
              style={{ height: 'auto', minHeight: '24px' }}
              // Simple auto-grow hack
              ref={el => { if(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }}} 
            />

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className={`p-2 rounded-xl flex items-center justify-center transition-all duration-200 ${
                inputText.trim() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400">Gemini can make mistakes. Please verify important technical details.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;