import { cn } from '../../lib/utils'
import type { Word } from '../../types/index'
import { useState } from 'react';


interface FlashCardProps {
    word: Word;
}

export function FlashCard({ word }: FlashCardProps) {
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    return (
      <div 
      onClick={() => setIsFlipped(!isFlipped)} // Sửa lại onClick viết hoa chữ C
      className="w-full h-48 cursor-pointer [perspective:1000px] group"
    >
     {/* THÂN THẺ: Nơi thực hiện hiệu ứng xoay 3D */}
      <div 
        className={cn(
          "relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]" // ← QUAN TRỌNG: Lật xoay 180 độ khi click
        )}
      >
        
        {/* MẶT TRƯỚC: Hiển thị từ tiếng Anh (Chỉ hiện khi chưa lật) */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl shadow-sm [backface-visibility:hidden]">
          <span className="text-2xl font-bold text-primary tracking-tight">
            {word.word || word.english} {/* Đọc từ tiếng Anh */}
          </span>
          {word.phonetic && (
            <span className="text-muted-foreground text-sm mt-2 font-mono">
              {word.phonetic} {/* Nhắc lại kiến thức Task 1.4: render phonetic nếu có */}
            </span>
          )}
          <p className="text-xs text-muted-foreground opacity-60 absolute bottom-3">Bấm để xem nghĩa</p>
        </div>

        {/* MẶT SAU: Hiển thị nghĩa tiếng Việt (Bị giấu đi, lật ra mới thấy) */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 bg-primary text-primary-foreground rounded-2xl shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="text-xl font-semibold text-center">
            {word.meaning || word.vietnamese} {/* Đọc nghĩa tiếng Việt */}
          </span>
          {word.example && (
            <p className="text-xs text-primary-foreground/80 text-center italic mt-3 max-w-[80%]">
              "{word.example}" {/* Render câu ví dụ nếu có */}
            </p>
          )}
          <p className="text-[10px] text-primary-foreground/60 absolute bottom-3">Bấm để lật lại</p>
        </div>

      </div>
    </div>
  );
}