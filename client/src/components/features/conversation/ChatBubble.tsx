import { Volume2 } from 'lucide-react';
import type { Message } from '../../../types';

interface ChatBubbleProps {
  msg: Message;
  isLastMessage: boolean;
  isStreaming: boolean;
  playAudio: (text: string) => void;
}

export function ChatBubble({ msg, isLastMessage, isStreaming, playAudio }: ChatBubbleProps) {
  const isUser = msg.sender === 'user';

  return (
    <div className={`flex items-start gap-3 max-w-[80%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
      {/* Avatar Robot cho AI */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm shrink-0 select-none">
          🤖
        </div>
      )}

      {/* Bubble Tin nhắn */}
      <div className="space-y-1">
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed relative group ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-none'
              : 'bg-card border border-border/80 text-foreground rounded-tl-none'
          }`}
        >
          {/* Text tiếng Anh */}
          <p className="font-medium">
            {msg.text || (isStreaming && isLastMessage ? '...' : '')}
          </p>

          {/* Nút loa phát âm cho tin nhắn AI */}
          {!isUser && msg.text && (
            <button
              onClick={() => playAudio(msg.text)}
              className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dịch nghĩa tiếng Việt cho câu của AI */}
        {!isUser && msg.translation && (
          <p className="text-[11px] text-muted-foreground italic pl-1">
            {msg.translation}
          </p>
        )}
      </div>
    </div>
  );
}
