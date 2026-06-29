import { useState } from 'react';
import { Search, Trash2, Volume2, BookHeart, Star, Clock, ArrowDownUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBookmarkedWords, toggleWordBookmark } from '../services/vocab';

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * COMPONENT: VocabNotebookPage - Sổ tay từ vựng cá nhân
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CHỨC NĂNG:
 * - Hiển thị tất cả từ vựng user đã lưu
 * - Tìm kiếm (search) theo từ tiếng Anh, tiếng Việt, hoặc topic
 * - Sắp xếp (sort): Mới nhất, Cũ nhất, A→Z
 * - Xóa từ khỏi sổ tay (có confirm)
 * - Nghe phát âm từ
 * - Hiển thị thống kê: tổng từ, số topics, từ cần ôn tập
 * 
 * FLOW:
 * - Nếu empty → Hiển thị empty state với hướng dẫn
 * - Nếu có từ → Hiển thị 3 stats cards + search bar + danh sách từ
 */

type SortOption = 'newest' | 'oldest' | 'az';

export default function VocabNotebookPage() {
  /**
   * ════ STATE MANAGEMENT ════
   */

  const [search, setSearch] = useState(''); // Chuỗi tìm kiếm
  const [sort, setSort] = useState<SortOption>('newest'); // Lựa chọn sắp xếp
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // ID từ đang chờ confirm xóa
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: toggleWordBookmark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  });

  const { data: bookmarkedWords = [], isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: fetchBookmarkedWords,
  });
  /**
   * ════ UTILITY FUNCTIONS ════
   */

  /**
   * Phát âm từ tiếng Anh bằng Web Speech API
   * - Ngôn ngữ: English (US)
   * - Tốc độ: 0.85 (chậm để dễ nghe)
   */
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  /**
   * ════ COMPUTED VALUES (Biến phái sinh) ════
   * Tự động tính toán từ  bookmarkedWords + search + sort
   */

  /**
   * Danh sách từ sau khi áp dụng FILTER (search) + SORT
   * 1. Filter: tìm kiếm trong english, vietnamese, topic
   * 2. Sort: theo newest/oldest/a-z
   */
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

  // Số lượng chủ đề duy nhất (dùng Set để deduplicate)
  const topicGroups = Array.from(new Set(bookmarkedWords.map((w) => w.topic)));

  // Đếm từ đã đến hạn ôn tập (nextReview <= hôm nay)
  const dueWordsCount = bookmarkedWords.filter((w) => new Date(w.nextReview) <= new Date()).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/**
        * ════ HEADER SECTION ════
        * Hiển thị:
        * - Tên trang: "Sổ tay từ vựng cá nhân"
        * - Subtitle: Tổng số từ + số topics
        * - Hoặc message "Sổ tay đang trống" nếu chưa lưu từ nào
        */}
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tight mb-1">Sổ tay từ vựng cá nhân</h2>
        <p className="text-muted-foreground text-sm font-medium">
          {bookmarkedWords.length > 0
            ? `${bookmarkedWords.length} từ đã lưu từ ${topicGroups.length} chủ đề`
            : 'Lưu từ vựng ở bất kỳ đâu để ôn tập tại đây'}
        </p>
      </div>

      {bookmarkedWords.length === 0 ? (
        /**
         * ════ EMPTY STATE - Hiển thị khi chưa lưu từ nào
         * Gồm:
         * - Emoji mailbox 📭
         * - Hướng dẫn: Cách lưu từ
         * - Mẹo: Ôn tập định kỳ giúp nhớ lâu hơn
         */
        <div className="bg-card border border-border rounded-3xl text-center py-20 space-y-5 shadow-xs">
          <div className="text-6xl drop-shadow-sm">📭</div>
          <div>
            <h3 className="text-foreground text-xl font-bold">Sổ tay đang trống</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Nhấn vào biểu tượng 🔖 khi học từ vựng để lưu vào đây và ôn tập sau.
            </p>
          </div>
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 max-w-sm mx-auto">
            <p className="text-primary text-xs font-semibold">
              💡 Mẹo: Ôn tập định kỳ giúp nhớ từ lâu hơn gấp 5 lần!
            </p>
          </div>
        </div>
      ) : (
        /**
          * ════ LOADED STATE - Hiển thị danh sách từ đã lưu
          */
        <div className="space-y-6">

          {/**
            * ════ SECTION 1: 3 STATS CARDS ════
            * Hiển thị:
            * 1. Tổng từ đã lưu
            * 2. Số chủ đề (topics)
            * 3. Số từ cần ôn tập (overdue)
            * 
            * Mỗi card có: icon + label + value
            */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: BookHeart, label: 'Tổng từ', value: bookmarkedWords.length, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
              { icon: Star, label: 'Chủ đề', value: topicGroups.length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
              { icon: Clock, label: 'Cần ôn', value: dueWordsCount, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-xs transition-all hover:shadow-md">
                  <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs font-semibold">{s.label}</p>
                    <p className="text-foreground text-2xl font-bold tracking-tight">{s.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/**
            * ════ SECTION 2: SEARCH & SORT TOOLBAR ════
            * 2 controls:
            * 1. Search box - tìm kiếm real-time
            * 2. Select dropdown - chọn thứ tự sắp xếp
            */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Thanh tìm kiếm */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm từ vựng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-card rounded-2xl border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs transition-shadow"
              />
            </div>

            {/* Bộ lọc Sắp xếp */}
            <div className="relative shrink-0">
              <ArrowDownUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="w-full sm:w-40 pl-11 pr-10 py-3 bg-card border border-border text-foreground rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs cursor-pointer transition-shadow"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="az">A → Z</option>
              </select>
            </div>
          </div>

          {/**
            * ════ SECTION 3: WORD LIST ════
            * Hiển thị danh sách từ sau filter+sort
            * 
            * Mỗi word card có:
            * - Column 1 (flex-1):
            *   - Từ + button nghe + phonetic + difficulty badge
            *   - Dịch tiếng Việt
            *   - Ví dụ (trong box muted)
            *   - Topic badge + review count
            * 
            * - Column 2 (shrink-0):
            *   - Button xóa (toggle confirm)
            *   - Nếu confirmed: 2 button "Xóa" + "Hủy"
            * 
            * Visual indicator:
            * - Nếu overdue (isDue): border/bg amber + emoji 🔔
            * - Hover: shadow + border change
            */}
          {/* No results state */}
          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-xs">
              <p className="text-muted-foreground text-sm font-medium">🔍 Không tìm thấy từ nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((word) => {
                /**
                  * Kiểm tra từ này có đến hạn ôn tập hay không
                  * - isDue = true → hiển thị badge cảnh báo 🔔
                  * - isDue = true → style card với border/bg amber
                  */
                const isDue = new Date(word.nextReview) <= new Date();
                return (
                  <div
                    key={word.id}
                    className={`bg-card border rounded-2xl p-6 transition-all hover:shadow-md group relative ${isDue ? 'border-amber-500/30 bg-amber-500/[0.02]' : 'border-border hover:border-primary/20'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">

                      {/**
                        * LEFT COLUMN: Nội dung từ vựng (flex-1)
                        * - Từ tiếng Anh + button nghe
                        * - Phonetic + difficulty badge
                        * - Dịch tiếng Việt
                        * - Ví dụ (italic, background muted)
                        * - Topic badge + review count
                        */}
                      <div className="flex-1 space-y-2">
                        {/* Hàng 1: Từ vựng, Phóng âm, Badge */}
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

                        {/* Hàng 2: Nghĩa tiếng Việt */}
                        <p className="text-foreground text-base font-bold pt-0.5">
                          {word.vietnamese}
                        </p>

                        {/* Hàng 3: Ví dụ */}
                        <p className="text-muted-foreground text-sm italic leading-relaxed">
                          "{word.example}"
                        </p>

                        {/* Hàng 4: Badge Topic và số lần ôn */}
                        <div className="flex items-center gap-4 pt-2">
                          <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md text-[11px] font-bold border border-indigo-500/10">
                            {word.topic}
                          </span>
                          <span className="text-muted-foreground text-[11px] font-medium">
                            Đã ôn: {word.reviewCount} lần
                          </span>
                        </div>
                      </div>

                      {/**
                        * RIGHT COLUMN: Delete button (shrink-0)
                        * - Khi hover: opacity 0 → 100
                        * - State 1: Đơn giản là trash icon (click → toggle confirm)
                        * - State 2: Show 2 button "Xóa" + "Hủy" với animation
                        */}
                      <div className="shrink-0 flex items-center h-full pt-1">
                        {confirmDelete === word.id ? (
                          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                            <button
                              onClick={() => { deleteMutation.mutate(word.id); setConfirmDelete(null); }}
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
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}