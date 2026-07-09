import { useState } from 'react';
import { ChevronLeft, BookmarkCheck } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import confetti from 'canvas-confetti';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWordsByTopic, toggleWordBookmark, toggleWordLearned } from '../services/vocab';
import type { VocabularyTopic, Word } from '../types';
import { topics } from '../constants/vocabulary';
import { WordTable } from '../components/features/vocabulary/WordTable';
import { TopicList } from '../components/features/vocabulary/TopicList';

export default function VocabularyPage() {
  const savedWords = useAppStore((state) => state.savedWords);
  const saveWord = useAppStore((state) => state.saveWord);
  const removeWord = useAppStore((state) => state.removeWord);
  const addXP = useAppStore((state) => state.addXP);

  const [selectedTopic, setSelectedTopic] = useState<VocabularyTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [justSaved, setJustSaved] = useState<string | null>(null);

  const { data: words = [], isLoading } = useQuery<Word[]>({
    queryKey: ['words', selectedTopic?.id],
    queryFn: () => fetchWordsByTopic(selectedTopic!.id),
    enabled: !!selectedTopic,
  });

  const queryClient = useQueryClient();
  const bookmarkMutation = useMutation({
    mutationFn: toggleWordBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words', selectedTopic?.id] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const learnedMutation = useMutation({
    mutationFn: toggleWordLearned,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['words', selectedTopic?.id] });
      if (data?.user) useAuthStore.setState({ user: data.user });
    },
  });

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allLearned = words.length > 0 && words.every((w) => learnedWords.has(w.english));

  const handleLearnWord = (word: Word) => {
    setLearnedWords((prev) => {
      const next = new Set(prev);
      if (next.has(word.english)) {
        next.delete(word.english);
      } else {
        next.add(word.english);
        addXP(10);
        if (words.every((w) => w.english === word.english || next.has(w.english))) {
          try { confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } }); } catch (e) {}
        }
      }
      return next;
    });
    learnedMutation.mutate(word.id);
  };

  const handleSaveWord = (word: Word) => {
    if (!selectedTopic) return;
    const isSaved = typeof word.isBookmarked === 'boolean' ? word.isBookmarked : isWordSaved(word.english);

    if (isSaved) {
      const offlineWord = savedWords.find((w) => w.english === word.english);
      if (offlineWord) removeWord(offlineWord.id);
    } else {
      saveWord({
        english: word.english,
        vietnamese: word.vietnamese,
        phonetic: word.phonetic || '',
        example: word.example || '',
        topic: selectedTopic.name,
      });
      setJustSaved(word.english);
      addXP(5);
      setTimeout(() => setJustSaved(null), 2000);
    }
    bookmarkMutation.mutate(word.id);
  };

  const isWordSaved = (english: string) => savedWords.some((w) => w.english === english);

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {selectedTopic ? (
            <>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <button onClick={() => setSelectedTopic(null)} className="hover:text-primary transition-colors cursor-pointer">Từ vựng</button>
                <span>/</span> <span className="text-foreground">{selectedTopic.name}</span>
              </div>
              <h2 className="text-foreground text-2xl font-bold tracking-tight">{selectedTopic.name}</h2>
              <p className="text-muted-foreground text-xs font-medium">{words.length} từ vựng · {learnedWords.size} đã học</p>
            </>
          ) : (
            <>
              <h2 className="text-foreground text-2xl font-bold tracking-tight">Từ vựng & Cụm từ</h2>
              <p className="text-muted-foreground text-sm font-medium">Học từ vựng theo chủ đề giúp ghi nhớ hiệu quả hơn</p>
            </>
          )}
        </div>

        {selectedTopic && (
          <button
            onClick={() => setSelectedTopic(null)}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent text-sm font-medium transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </button>
        )}
      </div>

      {!selectedTopic ? (
        <TopicList
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredTopics={filteredTopics}
          onSelectTopic={(topic) => setSelectedTopic(topic)}
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          <span className="animate-pulse">⏳ Đang tải từ vựng...</span>
        </div>
      ) : (
        <WordTable
          words={words}
          learnedWords={learnedWords}
          isWordSaved={isWordSaved}
          onSaveWord={handleSaveWord}
          onLearnWord={handleLearnWord}
          speak={speak}
          allLearned={allLearned}
        />
      )}

      {justSaved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 z-50 animate-in slide-in-from-bottom-4 text-xs font-bold">
          <BookmarkCheck className="w-4 h-4 text-emerald-400 fill-current" />
          <span>Đã lưu vào sổ tay (+5 XP)</span>
        </div>
      )}
    </div>
  );
}