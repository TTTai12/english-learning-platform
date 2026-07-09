import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { ChatBubble } from '../components/features/conversation/ChatBubble';
import { ChatInput } from '../components/features/conversation/ChatInput';
import { ScenarioSelector } from '../components/features/conversation/ScenarioSelector';
import type { Scenario, Message } from '../types';

export default function ConversationPage() {
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const token = useAuthStore((state) => state.token);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartConversation = (scenario: Scenario) => {
    setActiveScenario(scenario);
    const parts = scenario.firstMessage.split('\nvn: ');
    const firstMsg: Message = {
      id: 'first',
      sender: 'ai',
      text: parts[0],
      translation: parts[1] || '',
    };
    setMessages([firstMsg]);
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isStreaming || !activeScenario) return;

    const userText = inputText;
    setInputText('');

    const newMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsStreaming(true);

    const history = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    try {
      const response = await fetch('http://localhost:5000/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          systemInstruction: activeScenario.systemInstruction,
          message: userText,
          history,
        }),
      });

      if (!response.ok) throw new Error('API Error');
      if (!response.body) throw new Error('No body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMsgId = String(Date.now() + 1);

      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, sender: 'ai', text: '', translation: '' },
      ]);

      let fullText = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        const parts = fullText.split('\nvn: ');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? { ...msg, text: parts[0], translation: parts[1] || '' }
              : msg
          )
        );
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 2), sender: 'ai', text: 'Error connecting to AI chat.' },
      ]);
    } finally {
      setIsStreaming(false);
      useAuthStore.getState().getMe();
    }
  };

  if (!activeScenario) {
    return <ScenarioSelector onSelect={handleStartConversation} />;
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-card/20 border border-border/80 rounded-3xl overflow-hidden shadow-xs">
      <div className="bg-card border-b border-border/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{activeScenario.icon}</span>
          <div>
            <h3 className="text-foreground font-bold text-sm">{activeScenario.title}</h3>
            <p className="text-xs text-emerald-500 font-medium">AI đang mô phỏng • +8 XP/tin nhắn</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStartConversation(activeScenario)}
            title="Bắt đầu lại cuộc hội thoại"
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveScenario(null); setMessages([]); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Đóng
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/10">
        {messages.map((msg, index) => (
          <ChatBubble
            key={msg.id}
            msg={msg}
            isLastMessage={index === messages.length - 1}
            isStreaming={isStreaming}
            playAudio={playAudio}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        isStreaming={isStreaming}
        onSubmit={handleSend}
      />
    </div>
  );
}
