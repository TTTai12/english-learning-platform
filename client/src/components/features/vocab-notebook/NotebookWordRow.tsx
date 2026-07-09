import { Volume2, Trash2 } from 'lucide-react';
import type { SavedWord } from '../../../types';

interface NotebookWordRowProps {
  word: SavedWord;
  speak: (text: string) => void;
  confirmDelete: string | null;
  setConfirmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
}

export function NotebookWordRow({
  word,
  speak,
  confirmDelete,
  setConfirmDelete,
  onDelete,
}: NotebookWordRowProps) {
  const isDue = new Date(word.nextReview) <= new Date();

  return (
    <div
      className={`bg-card border rounded-2xl p-6 transition-all hover:shadow-md group relative ${
        isDue ? 'border-amber-500/30 bg-amber-500/[0.02]' : 'border-border hover:border-primary/20'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* LEFT COLUMN: Nội dung từ vựng */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-foreground text-xl font-bold tracking-tight">{word.english}</h3>
            <button
              onClick={() => speak(word.english)}
              className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              title="Nghe phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <span className="text-muted-foreground text-sm font-mono tracking-wide">{word.phonetic}</span>

            {isDue && (
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border border-amber-500/20">
                🔔 Đến hạn ôn
              </span>
            )}
          </div>

          <p className="text-foreground text-base font-bold pt-0.5">{word.vietnamese}</p>
          <p className="text-muted-foreground text-sm italic leading-relaxed">"{word.example}"</p>

          <div className="flex items-center gap-4 pt-2">
            <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md text-[11px] font-bold border border-indigo-500/10">
              {word.topic}
            </span>
            <span className="text-muted-foreground text-[11px] font-medium">
              Đã ôn: {word.reviewCount} lần
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Delete button */}
        <div className="shrink-0 flex items-center h-full pt-1">
          {confirmDelete === word.id ? (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => {
                  onDelete(word.id);
                  setConfirmDelete(null);
                }}
                className="px-3 py-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Xóa
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 bg-muted text-muted-foreground hover:text-foreground rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(word.id)}
              className="p-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all cursor-pointer"
              title="Xóa khỏi sổ tay"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
