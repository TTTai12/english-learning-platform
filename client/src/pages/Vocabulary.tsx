import { useState } from 'react';
import { Search, Volume2, BookmarkPlus, BookmarkCheck, ChevronLeft, CheckCircle, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore'
import confetti from 'canvas-confetti';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWordsByTopic, toggleWordBookmark, toggleWordLearned } from '../services/vocab';

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * PHẦN 1: ĐỊNH NGHĨA TYPES & CONSTANTS
 * ════════════════════════════════════════════════════════════════════════════════
 */

/** Interface định nghĩa cấu trúc của một chủ đề từ vựng */
interface Topic {
  id: string;
  name: string;
  icon: string;
  wordCount: number;
  learnedCount: number;
  color: string;
  borderColor: string; // Border color cho card chủ đề (dùng Tailwind gradient color)
  iconBg: string; // Background color của icon
}

/** Interface định nghĩa cấu trúc của một từ vựng trong bài học */
interface Word {
  id: string;
  english: string;
  vietnamese: string;
  phonetic: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard'; // Mức độ khó của từ
}

/**
 * MOCK DATA: Danh sách 6 chủ đề học tập
 * - Mỗi chủ đề có: ID, tên, emoji icon, tổng số từ, số từ đã học
 * - Dùng Tailwind CSS color system để style theo từng chủ đề
 */
const topics: Topic[] = [
  { id: 'daily', name: 'Giao tiếp hàng ngày', icon: '💬', wordCount: 150, learnedCount: 87, color: 'bg-blue-500/5 dark:bg-blue-900/10', borderColor: 'border-blue-500/15 dark:border-blue-700/30', iconBg: 'bg-blue-500/10 text-blue-600' },
  { id: 'business', name: 'Công việc & Kinh doanh', icon: '💼', wordCount: 200, learnedCount: 54, color: 'bg-emerald-500/5 dark:bg-emerald-900/10', borderColor: 'border-emerald-500/15 dark:border-emerald-700/30', iconBg: 'bg-emerald-500/10 text-emerald-600' },
  { id: 'travel', name: 'Du lịch', icon: '✈️', wordCount: 120, learnedCount: 95, color: 'bg-purple-500/5 dark:bg-purple-900/10', borderColor: 'border-purple-500/15 dark:border-purple-700/30', iconBg: 'bg-purple-500/10 text-purple-600' },
  { id: 'food', name: 'Ẩm thực', icon: '🍜', wordCount: 100, learnedCount: 41, color: 'bg-amber-500/5 dark:bg-amber-900/10', borderColor: 'border-amber-500/15 dark:border-amber-700/30', iconBg: 'bg-amber-500/10 text-amber-600' },
  { id: 'health', name: 'Sức khỏe & Y tế', icon: '🏥', wordCount: 90, learnedCount: 22, color: 'bg-rose-500/5 dark:bg-rose-900/10', borderColor: 'border-rose-500/15 dark:border-rose-700/30', iconBg: 'bg-rose-500/10 text-rose-600' },
  { id: 'technology', name: 'Công nghệ & IT', icon: '💻', wordCount: 180, learnedCount: 113, color: 'bg-indigo-500/5 dark:bg-indigo-900/10', borderColor: 'border-indigo-500/15 dark:border-indigo-700/30', iconBg: 'bg-indigo-500/10 text-indigo-600' },
];

/**
 * MOCK DATA: Từ vựng theo chủ đề
 * - Key là ID của chủ đề, Value là mảng các từ trong chủ đề
 * - Mỗi từ có: từ tiếng Anh, dịch tiếng Việt, phiên âm, ví dụ, độ khó
 */
// const wordsByTopic: Record<string, Word[]> = {
//   daily: [
//     { english: 'Collaborate', vietnamese: 'Cộng tác, hợp tác', phonetic: '/kəˈlæbəreɪt/', example: 'We collaborate with international teams on this project.', difficulty: 'medium' },
//     { english: 'Achievement', vietnamese: 'Thành tích, thành tựu', phonetic: '/əˈtʃiːvmənt/', example: 'This is a great achievement for our team.', difficulty: 'easy' },
//     { english: 'Enthusiastic', vietnamese: 'Nhiệt tình, hăng hái', phonetic: '/ɪnˌθuːziˈæstɪk/', example: 'She is very enthusiastic about learning new skills.', difficulty: 'hard' },
//   ],
//   business: [
//     { english: 'Negotiation', vietnamese: 'Đàm phán, thương lượng', phonetic: '/nɪˌɡoʊʃiˈeɪʃn/', example: 'The negotiation lasted three hours but ended successfully.', difficulty: 'hard' },
//     { english: 'Stakeholder', vietnamese: 'Bên liên quan, cổ đông', phonetic: '/ˈsteɪkhoʊldər/', example: 'We need to present the plan to all stakeholders.', difficulty: 'medium' },
//   ],
//   travel: [
//     { english: 'Itinerary', vietnamese: 'Lịch trình chuyến đi', phonetic: '/aɪˈtɪnəreri/', example: 'Please check your itinerary for hotel check-in times.', difficulty: 'hard' },
//   ],
//   food: [
//     { english: 'Ingredient', vietnamese: 'Nguyên liệu, thành phần', phonetic: '/ɪnˈɡriːdiənt/', example: 'The secret ingredient makes this dish special.', difficulty: 'medium' },
//   ],
//   health: [
//     { english: 'Symptom', vietnamese: 'Triệu chứng', phonetic: '/ˈsɪmptəm/', example: 'What symptoms have you been experiencing?', difficulty: 'medium' },
//   ],
//   technology: [
//     { english: 'Algorithm', vietnamese: 'Thuật toán', phonetic: '/ˈælɡərɪðəm/', example: 'The algorithm processes millions of data points.', difficulty: 'medium' },
//   ],
// };

/**
 * Cấu hình hiển thị mức độ khó của từ vựng
 * - Mỗi mức độ có: label tiếng Việt và màu sắc Tailwind CSS
 */
const difficultyConfig = {
  easy: { label: 'Dễ', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  medium: { label: 'Trung bình', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  hard: { label: 'Khó', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
};

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * COMPONENT: VocabularyPage - Trang học từ vựng theo chủ đề
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * FLOW:
 * 1. Hiển thị bảng chủ đề (khi selectedTopic = null)
 * 2. Click chủ đề → hiển thị danh sách từ chi tiết (selectedTopic != null)
 * 3. User có thể:
 *    - Lưu từ vào sổ tay (bookmark)
 *    - Nghe phát âm (text-to-speech)
 *    - Đánh dấu từ đã học (tracking learning progress)
 */
export default function VocabularyPage() {
  // 1. Lấy mảng danh sách từ vựng đã lưu (biến dữ liệu)
  const savedWords = useAppStore((state) => state.savedWords);

  // 2. Lấy hàm dùng để lưu từ vựng (hàm hành động)
  const saveWord = useAppStore((state) => state.saveWord);

  // 3. Lấy hàm dùng để cộng điểm kinh nghiệm (hàm hành động)
  const addXP = useAppStore((state) => state.addXP);

  /**
   * ════ STATE MANAGEMENT ════
   * - selectedTopic: Chủ đề đang được chọn (null = hiển thị danh sách chủ đề)
   * - searchQuery: Chuỗi tìm kiếm chủ đề
   * - learnedWords: Set các từ đã đánh dấu "đã học" trong phiên hiện tại
   * - justSaved: ID của từ vừa lưu (dùng để show toast thông báo)
   */
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [justSaved, setJustSaved] = useState<string | null>(null);

  const { data: words = [], isLoading } = useQuery({
    queryKey: ['words', selectedTopic?.id],  // ← cache riêng theo từng topic
    queryFn: () => fetchWordsByTopic(selectedTopic!.id),  // truyền string id, không phải object
    enabled: !!selectedTopic,  // chỉ gọi API khi đã chọn chủ đề
  });
  const queryClient = useQueryClient();
  const bookmarkMutation = useMutation({
    mutationFn: toggleWordBookmark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['words', selectedTopic?.id] }),

  });

  const learnedMutation = useMutation({
    mutationFn: toggleWordLearned,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['words', selectedTopic?.id] }),

  });

  /**
   * ════ COMPUTED VALUES (Biến phái sinh) ════
   * Những giá trị được tính toán từ state, tự động cập nhật khi state thay đổi
   */

  // Lọc danh sách chủ đề dựa trên searchQuery (TẦNG 1)
  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Lấy danh sách từ của chủ đề được chọn (TẦNG 2)
  // words đã được lấy từ useQuery ở trên (dữ liệu thực từ API)

  // Kiểm tra user đã học xong tất cả từ trong chủ đề hiện tại
  // Dùng để hiển thị banner thành công 🎉
  const allLearned = words.length > 0 && words.every((w) => learnedWords.has(w.english));

  const handleLearnWord = (word: Word) => {
    setLearnedWords((prev) => {
      const next = new Set(prev);
      if (next.has(word.english)) {
        next.delete(word.english);
        learnedMutation.mutate(word.id);
      } else {
        next.add(word.english);
        learnedMutation.mutate(word.id)
        addXP(10);
        if (words.every((w) => w.english === word.english || next.has(w.english))) {
          try { confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } }); } catch (e) { }
        }
      }
      return next;
    });
  };

  /**
   * ════ EVENT HANDLERS ════
   */

  /**
   * Lưu từ vào sổ tay từ vựng cá nhân
   * - Gọi hàm saveWord từ App context
   * - Cộng +5 XP cho user
   * - Hiển thị toast thông báo trong 2 giây
   */
  const handleSaveWord = (word: Word) => {
    if (!selectedTopic) return;
    saveWord({
      english: word.english,
      vietnamese: word.vietnamese,
      phonetic: word.phonetic,
      example: word.example,
      topic: selectedTopic.name,

    });
    bookmarkMutation.mutate(word.id);
    setJustSaved(word.english);
    addXP(5);
    setTimeout(() => setJustSaved(null), 2000);
  };

  /**
   * Kiểm tra xem từ đã được lưu hay chưa
   * @returns true nếu từ có trong savedWords, false nếu chưa
   */
  const isWordSaved = (english: string) => savedWords.some((w) => w.english === english);

  /**
   * Phát âm từ tiếng Anh bằng Web Speech API
   * - Ngôn ngữ: English (US)
   * - Tốc độ: 0.85 (chậm hơn bình thường để dễ nghe)
   */
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/**
        * ════ HEADER: Thay đổi nội dung tùy theo state selectedTopic
        * - Nếu selectedTopic = null: Hiển thị "Từ vựng & Cụm từ"
        * - Nếu selectedTopic != null: Hiển thị tên chủ đề + breadcrumb + nút quay lại
        */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {selectedTopic ? (
            <>
              {/* Định vị dòng chữ dẫn lối nhỏ (Breadcrumb) đúng ảnh image_cdb8b0.png */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <button onClick={() => setSelectedTopic(null)} className="hover:text-primary transition-colors cursor-pointer">Từ vựng</button>
                <span>/</span>
                <span className="text-foreground">{selectedTopic.name}</span>
              </div>
              <h2 className="text-foreground text-2xl font-bold tracking-tight">{selectedTopic.name}</h2>
              <p className="text-muted-foreground text-xs font-medium">
                {words.length} từ vựng · {learnedWords.size} đã học
              </p>
            </>
          ) : (
            <>
              <h2 className="text-foreground text-2xl font-bold tracking-tight">Từ vựng & Cụm từ</h2>
              <p className="text-muted-foreground text-sm font-medium">Học từ vựng theo chủ đề giúp ghi nhớ hiệu quả hơn</p>
            </>
          )}
        </div>

        {/* Nút Quay Lại đổi state về null ngay lập tức tại chỗ[cite: 2] */}
        {selectedTopic && (
          <button
            onClick={() => setSelectedTopic(null)}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent text-sm font-medium transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </button>
        )}
      </div>

      {/**
        * ════ TẦNG 1: DANH SÁCH CHỦĐỀ (Hiển thị khi selectedTopic === null)
        * 
        * Gồm:
        * 1. Search bar để lọc chủ đề
        * 2. Grid 3 cột (md) / 1 cột (sm) hiển thị các chủ đề
        * 3. Mỗi card chủ đề có:
        *    - Icon emoji
        *    - Tên chủ đề
        *    - Progress bar (X% đã học)
        *    - Click → chuyển đến TẦNG 2
        */}
      {!selectedTopic ? (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopics.map((topic) => {
              const percent = Math.round((topic.learnedCount / topic.wordCount) * 100);
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)} // Cập nhật state cục bộ tại chỗ[cite: 2]
                  className={`${topic.color} ${topic.borderColor} border rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 ${topic.iconBg} rounded-xl flex items-center justify-center text-xl border border-border/10 shadow-xs`}>
                      {topic.icon}
                    </div>
                    <span className="text-muted-foreground text-xs font-semibold">{topic.wordCount} từ</span>
                  </div>

                  <h3 className="text-foreground font-bold text-sm mb-1 group-hover:text-primary transition-colors">{topic.name}</h3>
                  <p className="text-muted-foreground text-xs font-medium mb-4">{topic.learnedCount}/{topic.wordCount} đã học</p>

                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-primary text-[11px] font-bold">{percent}% hoàn thành</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/**
            * ════ TẦNG 2: DANH SÁCH TỪ CHI TIẾT (Hiển thị khi selectedTopic !== null)
            *
            * Gồm:
            * 1. Banner thành công nếu đã học hết (allLearned = true)
            * 2. Danh sách từ (từng cái là 1 card)
            * 3. Mỗi card từ có:
            *    - Từ tiếng Anh + button nghe phát âm
            *    - Phiên âm IPA
            *    - Badge mức độ khó (easy/medium/hard)
            *    - Dịch nghĩa tiếng Việt
            *    - Ví dụ sử dụng (trong hộp muted)
            *    - Button bookmark lưu từ
            *    - Button "Đánh dấu đã học" (toggle state)
            */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              <span className="animate-pulse">⏳ Đang tải từ vựng...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/**
            * Banner thành công - Hiển thị khi user đã đánh dấu tất cả từ "đã học"
            * - Có animation fade-in
            * - Gradient background từ teal đến emerald
            * - Thông báo bonus XP
            */}
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
                  const isSaved = isWordSaved(word.english);
                  const isLearned = learnedWords.has(word.english);
                  const diff = difficultyConfig[word.difficulty];

                  return (
                    <div
                      key={word.english}
                      className={`bg-card border rounded-2xl p-6 transition-all relative ${isLearned
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
                          onClick={() => handleSaveWord(word)}
                          className={`p-2 rounded-xl transition-all border cursor-pointer ${isSaved
                            ? 'border-amber-500/20 text-amber-500 bg-amber-500/5'
                            : 'border-transparent text-muted-foreground hover:text-primary hover:bg-accent'
                            }`}
                        >
                          {isSaved ? <BookmarkCheck className="w-4.5 h-4.5 fill-current" /> : <BookmarkPlus className="w-4.5 h-4.5" />}
                        </button>
                      </div>

                      {/* NÚT LỚN ĐÁNH DẤU HOÀN TOÀN THEO ẢNH FIGMA (image_cdb8b0.png) */}
                      <button
                        onClick={() => handleLearnWord(word)}
                        className={`mt-4 w-full py-2.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${isLearned
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
          )}
        </>
      )}

      {/**
        * ════ TOAST NOTIFICATION
        * Hiển thị khi user vừa lưu từ
        * - Vị trí: Fixed ở bottom center
        * - Tự ẩn sau 2 giây
        * - Animation: slide-in-from-bottom
        */}
      {justSaved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 z-50 animate-in slide-in-from-bottom-4 text-xs font-bold">
          <BookmarkCheck className="w-4 h-4 text-emerald-400 fill-current" />
          <span>Đã lưu vào sổ tay (+5 XP)</span>
        </div>
      )}
    </div>
  );
}