import type { Word } from '../../../types';
import { Volume2, BookmarkPlus, BookmarkCheck, CheckCircle, Sparkles } from 'lucide-react';
import { difficultyConfig } from '../../../constants/vocabulary';

interface WordTableProps {
  words: Word[];
  learnedWords: Set<string>;
  isWordSaved: (english: string) => boolean;
  onSaveWord: (word: Word) => void;
  onLearnWord: (word: Word) => void;
  speak: (text: string) => void;
  allLearned: boolean;
}

export function WordTable({
  words,
  learnedWords,
  isWordSaved,
  onSaveWord,
  onLearnWord,
  speak,
  allLearned,
}: WordTableProps) {
  return (
    <div className="space-y-4">
      {/* Banner thành công - Hiển thị khi user đã đánh dấu tất cả từ "đã học" */}
      {allLearned && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-xs animate-in fade-in-50">
          <Sparkles className="w-5 h-5 fill-current text-amber-300" />
          <div>
            <p className="text-sm font-bold">🎉 Xuất sắc! Bạn đã cày xong chủ đề này!</p>
            <p className="text-xs opacity-90">+{words.length * 10} XP đã được nạp thẳng vào tài khoản học viên.</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {words.map((word) => {
          const isSaved = typeof word.isBookmarked === 'boolean' ? word.isBookmarked : isWordSaved(word.english);
          const isLearned = typeof word.isLearned === 'boolean' ? word.isLearned : learnedWords.has(word.english);
          const diff = difficultyConfig[word.difficulty as keyof typeof difficultyConfig];

          return (
            <div
              key={word.english}
              className={`bg-card border rounded-2xl p-6 transition-all relative ${
                isLearned
                  ? 'border-emerald-500/20 bg-emerald-500/[0.01]'
                  : 'border-border hover:border-primary/20 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-foreground text-xl font-bold tracking-tight">{word.english}</h3>
                    <button
                      onClick={() => speak(word.english)}
                      className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${diff.color}`}>
                      {diff.label}
                    </span>
                    {isLearned && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5 fill-current text-emerald-500/20" />
                        Đã học
                      </span>
                    )}
                  </div>

                  <p className="text-muted-foreground text-xs font-mono tracking-wide">{word.phonetic}</p>
                  <p className="text-foreground text-base font-semibold pt-0.5">{word.vietnamese}</p>

                  <div className="text-xs text-muted-foreground flex gap-1.5 items-start leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/40 mt-2">
                    <span className="select-none">📝</span>
                    <p className="italic">{word.example}</p>
                  </div>
                </div>

                <button
                  onClick={() => onSaveWord(word)}
                  className={`p-2 rounded-xl transition-all border cursor-pointer ${
                    isSaved
                      ? 'border-amber-500/20 text-amber-500 bg-amber-500/5'
                      : 'border-transparent text-muted-foreground hover:text-primary hover:bg-accent'
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-4.5 h-4.5 fill-current" /> : <BookmarkPlus className="w-4.5 h-4.5" />}
                </button>
              </div>

              {/* NÚT LỚN ĐÁNH DẤU HOÀN TOÀN THEO ẢNH FIGMA (image_cdb8b0.png) */}
              <button
                onClick={() => onLearnWord(word)}
                className={`mt-4 w-full py-2.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                  isLearned
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/20'
                    : 'bg-muted text-primary border-border hover:bg-primary/5'
                }`}
              >
                {isLearned ? '✓ Đã học xong (Bấm để hủy)' : '✓ Đánh dấu đã học (+10 XP)'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
