import { useState } from 'react';
import { Search, BookHeart, Star, Clock, ArrowDownUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBookmarkedWords, toggleWordBookmark } from '../services/vocab';
import type { SavedWord } from '../types';
import { NotebookWordRow } from '../components/features/vocab-notebook/NotebookWordRow';

type SortOption = 'newest' | 'oldest' | 'az';

export default function VocabNotebookPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: toggleWordBookmark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  });

  const { data: bookmarkedWords = [] } = useQuery<SavedWord[]>({
    queryKey: ['bookmarks'],
    queryFn: fetchBookmarkedWords,
  });

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const filtered = bookmarkedWords
    .filter((w) =>
      w.english.toLowerCase().includes(search.toLowerCase()) ||
      w.vietnamese.toLowerCase().includes(search.toLowerCase()) ||
      w.topic.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      if (sort === 'oldest') return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
      return a.english.localeCompare(b.english);
    });

  const topicGroups = Array.from(new Set(bookmarkedWords.map((w) => w.topic)));
  const dueWordsCount = bookmarkedWords.filter((w) => new Date(w.nextReview) <= new Date()).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tight mb-1">Sổ tay từ vựng cá nhân</h2>
        <p className="text-muted-foreground text-sm font-medium">
          {bookmarkedWords.length > 0
            ? `${bookmarkedWords.length} từ đã lưu từ ${topicGroups.length} chủ đề`
            : 'Lưu từ vựng ở bất kỳ đâu để ôn tập tại đây'}
        </p>
      </div>

      {bookmarkedWords.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl text-center py-20 space-y-5 shadow-xs">
          <div className="text-6xl drop-shadow-sm">📭</div>
          <div>
            <h3 className="text-foreground text-xl font-bold">Sổ tay đang trống</h3>
            <p className="text-muted-foreground text-sm mt-1">Khi học từ vựng hoặc flashcards, hãy click icon bookmark để lưu từ vào đây.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl shrink-0"><BookHeart className="w-6 h-6" /></div>
              <div><p className="text-muted-foreground text-xs font-semibold">TỔNG SỐ TỪ</p><h4 className="text-foreground text-2xl font-black mt-0.5">{bookmarkedWords.length}</h4></div>
            </div>
            <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center text-xl shrink-0"><Star className="w-6 h-6" /></div>
              <div><p className="text-muted-foreground text-xs font-semibold">CHỦ ĐỀ ĐÃ LƯU</p><h4 className="text-foreground text-2xl font-black mt-0.5">{topicGroups.length}</h4></div>
            </div>
            <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center text-xl shrink-0"><Clock className="w-6 h-6" /></div>
              <div><p className="text-muted-foreground text-xs font-semibold">CẦN ÔN TẬP</p><h4 className="text-foreground text-2xl font-black mt-0.5">{dueWordsCount}</h4></div>
            </div>
          </div>

          {/* FILTER & SORT BAR */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm từ vựng, nghĩa, hoặc chủ đề..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
              />
            </div>
            <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shrink-0">
              <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="bg-transparent text-foreground text-xs font-bold focus:outline-none cursor-pointer pr-4"
              >
                <option value="newest">Mới lưu nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="az">Từ A → Z</option>
              </select>
            </div>
          </div>

          {/* WORD LIST */}
          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-xs">
              <p className="text-muted-foreground text-sm font-medium">🔍 Không tìm thấy từ nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((word) => (
                <NotebookWordRow
                  key={word.id}
                  word={word}
                  speak={speak}
                  confirmDelete={confirmDelete}
                  setConfirmDelete={setConfirmDelete}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}