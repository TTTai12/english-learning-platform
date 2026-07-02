import { useState } from 'react';
import {
  Sparkles, ChevronLeft, ChevronRight, RotateCcw,
  CheckCircle, XCircle, Loader2, FileText, ArrowLeft
} from 'lucide-react';
// Import component FlashCard con 3D xịn sò mình vừa làm ở Task 2.1
import { FlashCard } from '../components/features/FlashCard';
import type { Word, Difficulty } from '../types'; // Đảm bảo import đúng type strict mode
import { useMutation } from '@tanstack/react-query';
import { reviewWord, generateFlashcardsFromText } from '../services/vocab';

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * PHẦN 1: ĐỊNH NGHĨA TYPES & CONSTANTS
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Interface định nghĩa cấu trúc thẻ flashcard được trích xuất từ text
 * - Khác với Word type vì có thêm fields: id, topic, isSaved
 * - Dùng để quản lý trạng thái của thẻ trong phiên học
 */
interface ExtractableCard {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  topic: string;
  difficulty: Difficulty;
  isSaved: boolean; // Có được lưu vào sổ tay hay không
}

/**
 * MOCK DATA: 2 đoạn văn mẫu để user thử nghiệm
 * - User có thể click các nút "Thử đoạn văn" để tự động điền text
 * - Giúp user test tính năng mà không cần copy-paste
 */
const sampleTexts = [
  {
    label: 'Đoạn văn IT',
    text: `Software deployment is the process of making a new application or update available to users. Modern deployment pipelines use continuous integration and continuous delivery (CI/CD) to automate testing and release cycles. Containerization with tools like Docker ensures consistent environments across development, staging, and production servers. Scalability and reliability are key considerations for any enterprise-grade system.`,
  },
  {
    label: 'Đoạn văn kinh doanh',
    text: `Revenue growth requires strategic stakeholder engagement and effective negotiation. Companies must leverage their competitive advantage while maintaining operational efficiency. Quarterly performance reviews help identify opportunities for optimization and risk mitigation. Sustainable profitability depends on customer acquisition and retention strategies.`,
  },
];

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * PHẦN 2: HÀM XỬ LÝ CHÍNH
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * GIẢ LẬP HÀM AI: Trích xuất từ vựng từ một đoạn text
 * 
 * LOGIC:
 * 1. Khởi tạo từ điển (wordMap) chứa từ vựng tiếng Anh => chi tiết
 * 2. Duyệt từng từ trong từ điển, kiểm tra có xuất hiện trong text không
 * 3. Nếu tìm thấy, thêm vào mảng result
 * 4. Nếu không tìm được từ nào, trả về 1 từ mặc định để UX tốt hơn
 * 
 * @param text - Đoạn text input từ user
 * @returns Mảng các thẻ flashcard được trích xuất
 */
const extractWordsFromText = (text: string): ExtractableCard[] => {
  // Từ điển từ vựng: key = từ để tìm kiếm, value = chi tiết từ
  const wordMap: Record<string, Omit<ExtractableCard, 'id'>> = {
    deployment: { word: 'Deployment', meaning: 'Triển khai (phần mềm)', phonetic: '/dɪˈplɔɪmənt/', example: 'The deployment was completed without any downtime.', topic: 'IT', difficulty: 'medium', isSaved: false },
    pipeline: { word: 'Pipeline', meaning: 'Quy trình xử lý liên tục', phonetic: '/ˈpaɪplaɪn/', example: 'Our CI/CD pipeline automates the release process.', topic: 'IT', difficulty: 'hard', isSaved: false },
    containerization: { word: 'Containerization', meaning: 'Container hóa ứng dụng', phonetic: '/kənˌteɪnəraɪˈzeɪʃn/', example: 'Containerization ensures consistent environments.', topic: 'IT', difficulty: 'hard', isSaved: false },
    scalability: { word: 'Scalability', meaning: 'Khả năng mở rộng', phonetic: '/ˌskeɪləˈbɪlɪti/', example: 'Scalability is critical for enterprise systems.', topic: 'IT', difficulty: 'hard', isSaved: false },
    reliability: { word: 'Reliability', meaning: 'Độ tin cậy, tính ổn định', phonetic: '/rɪˌlaɪəˈbɪlɪti/', example: 'System reliability determines user trust.', topic: 'IT', difficulty: 'medium', isSaved: false },
    revenue: { word: 'Revenue', meaning: 'Doanh thu', phonetic: '/ˈrevənjuː/', example: 'Revenue increased by 30% this quarter.', topic: 'Business', difficulty: 'medium', isSaved: false },
    stakeholder: { word: 'Stakeholder', meaning: 'Bên liên quan, cổ đông', phonetic: '/ˈsteɪkhoʊldər/', example: 'We need to update all stakeholders on the progress.', topic: 'Business', difficulty: 'hard', isSaved: false },
    negotiation: { word: 'Negotiation', meaning: 'Đàm phán, thương lượng', phonetic: '/nɪˌɡoʊʃiˈeɪʃn/', example: 'The negotiation resulted in a favorable contract.', topic: 'Business', difficulty: 'medium', isSaved: false },
  };

  const found: ExtractableCard[] = [];
  const lower = text.toLowerCase(); // Convert thành lowercase để tìm kiếm case-insensitive
  let index = 1;

  // Duyệt từng từ trong từ điển, kiểm tra có trong text không
  for (const [key, card] of Object.entries(wordMap)) {
    if (lower.includes(key)) {
      found.push({ id: String(index++), ...card });
    }
  }

  // Nếu tìm được từ, trả về danh sách; nếu không, trả về từ mặc định
  return found.length > 0 ? found : [
    { id: '1', word: 'Enterprise', meaning: 'Doanh nghiệp lớn', phonetic: '/ˈentərpraɪz/', example: 'Enterprise software requires robust security.', topic: 'General', difficulty: 'medium', isSaved: false }
  ];
};

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * COMPONENT: FlashcardsPage - Trang Flashcards AI
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * FLOW:
 * GIAI ĐOẠN 1 (totalCards === 0): Hiển thị form nhập text + 2 đoạn mẫu
 *                                    ↓
 * GIAI ĐOẠN 2 (sessionDone === false): Học lần lượt các thẻ
 *                                         - Có nút "Đã biết" / "Chưa biết"
 *                                         - Có thanh progress bar
 *                                    ↓
 * GIAI ĐOẠN 3 (sessionDone === true):  Hiển thị kết quả: X từ đã biết / Y từ chưa biết
 */
export default function FlashcardsPage() {
  /**
   * ════ STATE MANAGEMENT ════
   */
  const [text, setText] = useState(''); // Văn bản input từ user
  const [cards, setCards] = useState<ExtractableCard[]>([]); // Mảng thẻ được trích xuất
  const [isLoading, setIsLoading] = useState(false); // Flag đang xử lý AI (giả lập delay 1.2s)
  const [currentIdx, setCurrentIdx] = useState(0); // Index thẻ hiện tại
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set()); // Set index của thẻ "đã biết"
  const [unknownCards, setUnknownCards] = useState<Set<number>>(new Set()); // Set index của thẻ "chưa biết"
  const [sessionDone, setSessionDone] = useState(false); // Phiên học hoàn thành?


  const reviewMutation = useMutation({
    mutationFn: ({ wordId, isCorrect }: { wordId: string; isCorrect: boolean }) =>
      reviewWord(wordId, isCorrect),
  });
  const generateMutation = useMutation({
    mutationFn: (text: string) => generateFlashcardsFromText(text),
  });

  /**
   * ════ EVENT HANDLERS ════
   */

  /**
   * Click nút "Tạo bộ Flashcards"
   * 1. Validate text không rỗng
   * 2. Reset các state về ban đầu
   * 3. Simulate API delay 1.2s (giả lập AI processing)
   * 4. Gọi extractWordsFromText() để trích xuất từ
   * 5. Cập nhật cards state
   */
  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setCurrentIdx(0);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setSessionDone(false);

    try {
      // 1. Gọi API thật từ Backend
      const data = await generateMutation.mutateAsync(text);

      // 2. Ánh xạ các thuộc tính trả về từ AI (english, vietnamese) 
      // sang thuộc tính hiển thị trên UI (word, meaning)
      const generated: ExtractableCard[] = data.map((item: any) => ({
        id: item.id, // Sử dụng MongoDB ObjectId thật từ database trả về!
        word: item.english,
        meaning: item.vietnamese,
        phonetic: item.phonetic,
        example: item.example,
        topic: item.topic,
        difficulty: item.difficulty,
        isSaved: item.isSaved || false
      }));


      // 3. Cập nhật state để hiển thị lên thẻ
      setCards(generated);
    } catch (error) {
      console.error('Lỗi khi gọi API AI:', error);
      alert('Không thể kết nối với AI để trích xuất từ vựng. Vui lòng kiểm tra lại Server hoặc API key.');
    } finally {
      setIsLoading(false);
    }
  };


  /**
   * Chuyển sang thẻ tiếp theo
   * - Nếu là thẻ cuối cùng → đánh dấu session done
   * - Nếu không → increment currentIdx
   */
  const nextCard = () => {
    if (currentIdx + 1 >= cards.length) {
      setSessionDone(true);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  /**
   * Click nút "Đã thuộc lòng"
   * - Thêm index hiện tại vào knownCards set
   * - Chuyển sang thẻ tiếp theo
   */
  const handleKnow = () => {
    setKnownCards((prev) => new Set(prev).add(currentIdx));
    // TODO: Gọi reviewMutation.mutate với wordId = currentCard.id, isCorrect = true
    reviewMutation.mutate({ wordId: currentCard.id, isCorrect: true });
    nextCard();
  };


  /**
   * Click nút "Chưa thuộc kĩ"
   * - Thêm index hiện tại vào unknownCards set
   * - Chuyển sang thẻ tiếp theo
   */
  const handleDontKnow = () => {
    setUnknownCards((prev) => new Set(prev).add(currentIdx));
    // TODO: Tương tự handleKnow nhưng truyền isCorrect = false
    reviewMutation.mutate({ wordId: currentCard.id, isCorrect: false });
    nextCard();
  };

  /**
   * Học lại bộ này: Reset tất cả state
   */
  const resetSession = () => {
    setCurrentIdx(0);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setSessionDone(false);
  };

  /**
   * ════ COMPUTED VALUES (Biến phái sinh) ════
   * Tự động tính toán từ state, dùng để rendering
   */
  const currentCard = cards[currentIdx]; // Thẻ đang học
  const totalCards = cards.length; // Tổng số thẻ
  const progressPercent = totalCards > 0 ? ((currentIdx + 1) / totalCards) * 100 : 0; // % tiến độ

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-foreground text-2xl font-bold tracking-tight">Flashcards AI</h2>
        <p className="text-muted-foreground text-sm">Dán đoạn văn — AI tự động phân tích và trích xuất thẻ học thông minh.</p>
      </div>

      {/**
        * ════ GIAI ĐOẠN 1: CHƯA CÓ THẺ (totalCards === 0)
        * Hiển thị:
        * - Textarea để user dán text
        * - 2 nút "Thử đoạn văn" mẫu
        * - Nút "Tạo bộ Flashcards"
        * - Hướng dẫn về quy trình học
        */}
      {totalCards === 0 ? (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider">THỬ ĐOẠN VĂN MẪU:</span>
              <div className="flex gap-2 flex-wrap">
                {sampleTexts.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setText(s.text)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground border border-border rounded-xl hover:bg-muted transition-colors text-xs font-medium cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Dán một đoạn văn bản tiếng Anh bất kỳ vào đây... Hệ thống AI sẽ quét, bóc tách các từ vựng cốt lõi và biên soạn bộ thẻ học cho bạn ngay lập tức."
              value={text}
              maxLength={2000}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-44 px-4 py-3 bg-muted/40 text-foreground rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-sm leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-foreground text-xs font-medium">{text.length}/ 2000 ký tự</span>
              <button
                onClick={handleGenerate}
                disabled={!text.trim() || isLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Đang bóc tách dữ liệu...</>
                ) : (
                  <><Sparkles className="w-4 h-4 fill-current" />Tạo bộ Flashcards</>
                )}
              </button>
            </div>
          </div>

          {/* HƯỚNG DẪN BẰNG GRID CỦA TUẦN 1 */}
          <div className="bg-gradient-to-br from-primary/5 via-indigo-500/5 to-transparent border border-primary/10 rounded-2xl p-5">
            <h3 className="text-foreground text-sm font-bold mb-3">✨ Quy trình học máy thông minh</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Thu thập văn bản', desc: 'Dán tài liệu, email hoặc bài báo cần nghiên cứu.', icon: '📝' },
                { step: '2', title: 'Trích xuất thực thể', desc: 'Hệ thống tự động lọc ra các từ vựng nâng cao chuyên ngành.', icon: '🤖' },
                { step: '3', title: 'Lặp lại ngắt quãng', desc: 'Tiến hành phân loại ghi nhớ để đưa vào bộ nhớ dài hạn.', icon: '🎯' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3 items-start">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="text-foreground text-xs font-bold">{item.title}</h4>
                    <p className="text-muted-foreground text-[11px] mt-0.5 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : sessionDone ? (
        /**
          * ════ GIAI ĐOẠN 3: HOÀN THÀNH PHIÊN HỌC (sessionDone === true)
          * Hiển thị:
          * - Emoji celebration 🎉
          * - Kết quả: X từ đã biết / Y từ chưa biết
          * - 2 nút: "Học lại bộ này" / "Trích xuất văn bản mới"
          */
        <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-5 shadow-xs">
          <div className="text-5xl">🎉</div>
          <div className="space-y-1">
            <h3 className="text-foreground text-lg font-bold">Hoàn thành phiên ôn tập!</h3>
            <p className="text-muted-foreground text-sm">
              Bạn đã thuộc lòng <strong className="text-emerald-500 font-bold">{knownCards.size}</strong> / {totalCards} thuật ngữ.
            </p>
          </div>

          <div className="flex justify-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/10 px-4 py-2 rounded-xl">
              <CheckCircle className="w-4 h-4" />
              <span>{knownCards.size} Từ đã thuộc</span>
            </div>
            <div className="flex items-center gap-1.5 text-destructive bg-destructive/10 px-4 py-2 rounded-xl">
              <XCircle className="w-4 h-4" />
              <span>{unknownCards.size} Từ cần xem lại</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-3 border-t border-border">
            <button
              onClick={resetSession}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all text-sm font-semibold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Học lại bộ này
            </button>
            <button
              onClick={() => { setCards([]); setText(''); }}
              className="px-5 py-2.5 bg-muted text-foreground border border-border rounded-xl hover:bg-accent transition-all text-sm font-semibold cursor-pointer"
            >
              Trích xuất văn bản mới
            </button>
          </div>
        </div>
      ) : (
        /**
          * ════ GIAI ĐOẠN 2: ĐANG HỌC (totalCards > 0 && !sessionDone)
          * Hiển thị:
          * - Thanh tiến độ (X / Y thẻ)
          * - Component 3D FlashCard (lật được)
          * - 2 nút đánh giá: "Đã thuộc lòng" / "Chưa thuộc kĩ"
          * - 2 nút điều hướng: "Thẻ trước" / "Thẻ sau"
          */
        <div className="space-y-4">
          {/* ════ PROGRESS BAR & STATS ════ */}
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Tiến độ: {currentIdx + 1} / {totalCards}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-500"><CheckCircle className="w-3 h-3" />{knownCards.size}</span>
              <span className="flex items-center gap-1 text-destructive"><XCircle className="w-3 h-3" />{unknownCards.size}</span>
              <button
                onClick={() => { setCards([]); setText(''); }}
                className="text-muted-foreground hover:text-foreground text-[11px] font-bold flex items-center gap-1 cursor-pointer ml-2"
              >
                <ArrowLeft className="w-3 h-3" /> Thoát học
              </button>
            </div>
          </div>

          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* ════ FLASHCARD 3D - Component được import từ Task 2.1 ════ */}
          {/* 
            * key={currentCard.id} là vô cùng quan trọng!
            * Khi key thay đổi, React sẽ unmount & remount component
            * → FlashCard sẽ reset trạng thái lật (rotation) về mặt trước
          */}
          <div className="py-2">
            <FlashCard key={currentCard.id} word={currentCard as unknown as Word} />
          </div>

          {/* ════ EVALUATION BUTTONS - Người dùng đánh giá từng thẻ ════ */}
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

          {/* ════ NAVIGATION BUTTONS - Chuyển thẻ mà không đánh giá ════ */}
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