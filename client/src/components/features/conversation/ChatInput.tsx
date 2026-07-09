import React from 'react';
import { Send, Lightbulb } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  isStreaming: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInput({ inputText, setInputText, isStreaming, onSubmit }: ChatInputProps) {
  return (
    <div className="p-4 bg-card border-t border-border/80 space-y-2">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Nhập câu trả lời của bạn bằng tiếng Anh..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isStreaming}
          className="flex-1 px-4 py-3 bg-muted/40 text-foreground rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isStreaming}
          className="p-3 bg-primary text-primary-foreground rounded-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
        <Lightbulb className="w-3 h-3 text-amber-500" /> AI sẽ tự động sửa lỗi ngữ pháp nhẹ trực tiếp trong ngoặc [Correction: ...]
      </p>
    </div>
  );
}
