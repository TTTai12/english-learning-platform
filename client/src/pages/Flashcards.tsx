import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { FlashCard } from '../components/features/FlashCard';
import type { Word } from '../types';
import { useMutation } from '@tanstack/react-query';
import { reviewWord, generateFlashcardsFromText } from '../services/vocab';
import { extractWordsFromText } from '../constants/flashcards';
import { ExtractForm } from '../components/features/flashcards/ExtractForm';
import { SessionResult } from '../components/features/flashcards/SessionResult';

export default function FlashcardsPage() {
  const [text, setText] = useState('');
  const [cards, setCards] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<number>>(new Set());
  const [sessionDone, setSessionDone] = useState(false);

  const { mutate: generateMutation, isPending: isLoading } = useMutation({
    mutationFn: generateFlashcardsFromText,
    onSuccess: (data: any) => {
      const formatted = data.words.map((w: any, index: number) => ({
        id: String(index + 1),
        word: w.english,
        meaning: w.vietnamese,
        phonetic: w.phonetic,
        example: w.example,
        topic: w.topic || 'AI Generated',
        difficulty: w.difficulty,
        isSaved: false,
      }));
      setCards(formatted);
      setCurrentIdx(0);
      setKnownCards(new Set());
      setUnknownCards(new Set());
      setSessionDone(false);
    },
    onError: () => {
      const localWords = extractWordsFromText(text);
      setCards(localWords);
      setCurrentIdx(0);
      setKnownCards(new Set());
      setUnknownCards(new Set());
      setSessionDone(false);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ wordId, status }: { wordId: string; status: 'know' | 'dont_know' }) =>
      reviewWord(wordId, status === 'know'),
  });

  const handleGenerate = () => {
    if (!text.trim()) return;
    generateMutation(text);
  };

  const handleKnow = () => {
    reviewMutation.mutate({ wordId: cards[currentIdx].word, status: 'know' });
    setKnownCards((prev) => {
      const next = new Set(prev);
      next.add(currentIdx);
      return next;
    });
    nextCard();
  };

  const handleDontKnow = () => {
    reviewMutation.mutate({ wordId: cards[currentIdx].word, status: 'dont_know' });
    setUnknownCards((prev) => {
      const next = new Set(prev);
      next.add(currentIdx);
      return next;
    });
    nextCard();
  };

  const nextCard = () => {
    if (currentIdx < cards.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setSessionDone(true);
    }
  };

  const resetSession = () => {
    setCurrentIdx(0);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setSessionDone(false);
  };

  const handleExit = () => {
    setCards([]);
    setText('');
  };

  const currentCard = cards[currentIdx];
  const totalCards = cards.length;
  const progressPercent = totalCards > 0 ? ((currentIdx + 1) / totalCards) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Flashcards AI</h2>
        <p className="text-muted-foreground text-sm">Dán đoạn văn — AI tự động phân tích và trích xuất thẻ học thông minh.</p>
      </div>

      {totalCards === 0 ? (
        <ExtractForm
          text={text}
          setText={setText}
          isLoading={isLoading}
          onGenerate={handleGenerate}
        />
      ) : sessionDone ? (
        <SessionResult
          knownCount={knownCards.size}
          unknownCount={unknownCards.size}
          totalCards={totalCards}
          onReset={resetSession}
          onNewExtract={handleExit}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Tiến độ: {currentIdx + 1} / {totalCards}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-500"><CheckCircle className="w-3.5 h-3.5" />{knownCards.size}</span>
              <span className="flex items-center gap-1 text-destructive"><XCircle className="w-3.5 h-3.5" />{unknownCards.size}</span>
              <button
                onClick={handleExit}
                className="text-muted-foreground hover:text-foreground text-[11px] font-bold flex items-center gap-1 cursor-pointer ml-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Thoát học
              </button>
            </div>
          </div>

          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="py-2">
            <FlashCard key={currentCard.id} word={currentCard as unknown as Word} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={handleDontKnow}
              className="flex items-center justify-center gap-2 py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive/15 transition-all text-sm font-bold cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Chưa thuộc kĩ
            </button>
            <button
              onClick={handleKnow}
              className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/15 transition-all text-sm font-bold cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Đã thuộc lòng
            </button>
          </div>

          <div className="flex justify-center gap-6 pt-2">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Thẻ trước
            </button>
            <button
              onClick={() => setCurrentIdx((i) => Math.min(totalCards - 1, i + 1))}
              disabled={currentIdx === totalCards - 1}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Thẻ sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}