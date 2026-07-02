import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, ChevronLeft, Award } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { analyzeSpeakingSpeech, type SpeakingAnalysisResponse } from '../services/speaking';
import { fetchWordsByDifficulty } from '../services/vocab';

// GIẢI THÍCH: Khởi tạo đối tượng nhận diện giọng nói đa trình duyệt
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// GIẢI THÍCH: Danh sách bài tập dự phòng (Fallback UX) nếu database trống
const defaultMockExercises: Record<string, Array<{ id: string; english: string; vietnamese: string; example: string }>> = {
    easy: [
        { id: 'mock-e1', english: 'Hello', vietnamese: 'Xin chào, rất vui được gặp bạn.', example: 'Hello, nice to meet you.' },
        { id: 'mock-e2', english: 'Today', vietnamese: 'Bạn khỏe không?', example: 'How are you doing today.' }
    ],
    medium: [
        { id: 'mock-m1', english: 'Order', vietnamese: 'Tôi muốn đặt một tách latte nóng, vui lòng.', example: 'I would like to order a cup of hot latte please.' },
        { id: 'mock-m2', english: 'Excuse me', vietnamese: 'Xin lỗi, cửa hàng tiện lợi gần nhất ở đâu?', example: 'Excuse me where is the nearest convenience store.' }
    ],
    hard: [
        { id: 'mock-h1', english: 'Experience', vietnamese: 'Tôi có hai năm kinh nghiệm trong lĩnh vực phát triển web.', example: 'I have two years of experience in web development.' },
        { id: 'mock-h2', english: 'Collaborate', vietnamese: 'Chúng ta cần hợp tác trong dự án này để kịp tiến độ.', example: 'We need to collaborate on this project to meet the deadline.' }
    ]
};

type DifficultyType = 'easy' | 'medium' | 'hard';

export default function SpeakingPage() {
    // TODO: 1. State quản lý Cấp độ được chọn (Cơ bản - Trung cấp - Nâng cao)
    const [difficulty, setDifficulty] = useState<DifficultyType>('easy');

    // TODO: 2. State lưu bài tập đang luyện nói (null = đang ở màn hình chọn bài)
    const [selectedExercise, setSelectedExercise] = useState<any | null>(null);

    // States quản lý trạng thái của mic & kết quả phân tích
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [analysis, setAnalysis] = useState<SpeakingAnalysisResponse | null>(null);

    const recognitionRef = useRef<any>(null);

    // TODO: 3. Lấy dữ liệu từ Database theo độ khó thông qua TanStack Query
    const { data: dbWords, isLoading: isFetching } = useQuery({
        queryKey: ['speaking-exercises', difficulty],
        queryFn: () => fetchWordsByDifficulty(difficulty),
    });

    // GIẢI THÍCH: Gộp dữ liệu DB với dữ liệu Mock để đảm bảo trang không bị trống bài
    const exercises = dbWords && dbWords.length > 0
        ? dbWords.map((w: any) => ({
            id: w.id,
            english: w.english,
            vietnamese: w.vietnamese, // Nghĩa của từ vựng
            example: w.example || w.english, // Câu ví dụ để luyện nói
        }))
        : defaultMockExercises[difficulty];

    // Mutation gọi API chấm điểm ở Backend
    const analyzeMutation = useMutation({
        mutationFn: ({ targetPhrase, userSpeech }: { targetPhrase: string; userSpeech: string }) =>
            analyzeSpeakingSpeech(targetPhrase, userSpeech),
        onSuccess: (data) => {
            setAnalysis(data);
        },
        onError: (err) => {
            console.error(err);
            alert('Không thể kết nối với AI để chấm điểm nói.');
        }
    });

    // Khởi tạo SpeechRecognition của trình duyệt
    useEffect(() => {
        if (SpeechRecognition && selectedExercise) {
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.lang = 'en-US';
            rec.interimResults = false;

            rec.onstart = () => {
                setIsListening(true);
                setTranscript('');
                setAnalysis(null);
            };

            rec.onend = () => {
                setIsListening(false);
            };

            rec.onresult = (event: any) => {
                const resultText = event.results[0][0].transcript;
                setTranscript(resultText);
                // GIẢI THÍCH: Gửi câu đọc thực tế của user so sánh với câu ví dụ mẫu lên Backend
                analyzeMutation.mutate({
                    targetPhrase: selectedExercise.example,
                    userSpeech: resultText
                });
            };

            recognitionRef.current = rec;
        }
    }, [selectedExercise]);

    // Bật/tắt ghi âm
    const toggleListening = () => {
        if (!SpeechRecognition) {
            alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Hãy dùng Google Chrome!');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    // Phát âm mẫu (Text-To-Speech)
    const handlePlayAudio = (phrase: string) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = 'en-US';
        synth.speak(utterance);
    };

    // ==========================================
    // VIEW 1: MÀN HÌNH CHỌN BÀI TẬP (LIST VIEW)
    // ==========================================
    if (!selectedExercise) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-foreground text-2xl font-bold tracking-tight">Luyện nói với AI</h2>
                    <p className="text-muted-foreground text-sm">AI phân tích phát âm và chỉ ra chính xác lỗi của bạn</p>
                </div>

                {/* 3 Tabs Cấp Độ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Tab Cơ Bản */}
                    <button
                        onClick={() => setDifficulty('easy')}
                        className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${difficulty === 'easy'
                            ? 'border-primary/80 bg-primary/5 ring-1 ring-primary/80'
                            : 'border-border bg-card/40 hover:bg-card/75'
                            }`}
                    >
                        <span className="text-2xl mt-1">🌱</span>
                        <div>
                            <p className="text-foreground font-bold text-sm">Cơ bản</p>
                            <p className="text-muted-foreground text-xs mt-0.5">Phát âm câu từ đơn giản</p>
                        </div>
                    </button>

                    {/* Tab Trung Cấp */}
                    <button
                        onClick={() => setDifficulty('medium')}
                        className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${difficulty === 'medium'
                            ? 'border-primary/80 bg-primary/5 ring-1 ring-primary/80'
                            : 'border-border bg-card/40 hover:bg-card/75'
                            }`}
                    >
                        <span className="text-2xl mt-1">🌿</span>
                        <div>
                            <p className="text-foreground font-bold text-sm">Trung cấp</p>
                            <p className="text-muted-foreground text-xs mt-0.5">Câu giao tiếp thông dụng</p>
                        </div>
                    </button>

                    {/* Tab Nâng Cao */}
                    <button
                        onClick={() => setDifficulty('hard')}
                        className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${difficulty === 'hard'
                            ? 'border-primary/80 bg-primary/5 ring-1 ring-primary/80'
                            : 'border-border bg-card/40 hover:bg-card/75'
                            }`}
                    >
                        <span className="text-2xl mt-1">🌳</span>
                        <div>
                            <p className="text-foreground font-bold text-sm">Nâng cao</p>
                            <p className="text-muted-foreground text-xs mt-0.5">Đoạn hội thoại phức tạp</p>
                        </div>
                    </button>
                </div>

                {/* Danh sách bài tập */}
                <div className="space-y-4">
                    <p className="text-foreground text-xs font-semibold tracking-wider text-muted-foreground">CHỌN BÀI TẬP ĐỂ BẮT ĐẦU:</p>

                    {isFetching ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">Đang tải danh sách bài tập từ database...</div>
                    ) : (
                        <div className="space-y-3">
                            {exercises.map((ex: any) => (
                                <button
                                    key={ex.id}
                                    onClick={() => setSelectedExercise(ex)}
                                    className="w-full flex items-center justify-between bg-card/40 hover:bg-card/70 border border-border/80 p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer hover:border-primary/30"
                                >
                                    <div className="space-y-1">
                                        <p className="text-foreground text-sm font-bold font-mono tracking-wide">"{ex.example}"</p>
                                        <p className="text-muted-foreground text-xs">
                                            {ex.vietnamese ? `Nghĩa của từ khóa (${ex.english}): ${ex.vietnamese}` : 'Bài tập luyện phát âm'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider">
                                        <Award className="w-3.5 h-3.5" /> +20 XP
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW 2: MÀN HÌNH LUYỆN TẬP CHI TIẾT (PRACTICE)
    // ==========================================
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Nút quay lại Chọn bài khác */}
            <button
                onClick={() => { setSelectedExercise(null); setAnalysis(null); setTranscript(''); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
                <ChevronLeft className="w-4 h-4" /> Chọn bài khác
            </button>

            {/* Thẻ hiển thị câu hỏi mẫu */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs relative">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="text-foreground text-xl font-bold font-mono tracking-wide leading-relaxed pr-8">
                            {selectedExercise.example}
                        </h1>
                        <p className="text-muted-foreground text-xs">
                            {selectedExercise.vietnamese ? `Từ khóa học: ${selectedExercise.english} (${selectedExercise.vietnamese})` : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => handlePlayAudio(selectedExercise.example)}
                        className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/15 transition-colors cursor-pointer absolute right-6 top-6"
                    >
                        <Volume2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Thanh Dashed Sóng Âm (Dashed Soundwave) */}
                <div className="border-t-2 border-dashed border-border/80 w-full my-6"></div>

                {/* Nút Micro và hướng dẫn */}
                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                    <button
                        onClick={toggleListening}
                        className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2.5 transition-all duration-300 shadow-md cursor-pointer ${isListening
                            ? 'bg-destructive text-destructive-foreground animate-pulse scale-105'
                            : 'bg-primary text-primary-foreground hover:scale-105'
                            }`}
                    >
                        {isListening ? (
                            <>
                                <MicOff className="w-5 h-5 animate-bounce" /> Đang nghe... Dừng nói
                            </>
                        ) : (
                            <>
                                <Mic className="w-5 h-5" /> Bắt đầu nói
                            </>
                        )}
                    </button>
                    <span className="text-xs text-muted-foreground">
                        {isListening ? 'Hãy nói to rõ ràng vào mic điện thoại/máy tính của bạn' : 'Nhấn nút ghi âm để bắt đầu'}
                    </span>
                </div>

                {/* Văn bản ghi âm thực tế (Transcript) */}
                {transcript && (
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/80 space-y-2">
                        <span className="text-muted-foreground text-[10px] font-bold tracking-wider block">BẠN ĐÃ NÓI:</span>
                        <p className="text-foreground text-sm font-semibold italic">"{transcript}"</p>
                    </div>
                )}
            </div>

            {/* Bảng trạng thái tải chấm điểm */}
            {analyzeMutation.isPending && (
                <div className="bg-card border border-border rounded-2xl p-6 text-center text-sm text-muted-foreground animate-pulse">
                    Đang gửi dữ liệu phân tích phát âm sang AI chấm điểm...
                </div>
            )}

            {/* Bảng Kết quả Chấm Điểm của AI */}
            {analysis && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs">
                    <h3 className="text-foreground text-base font-bold flex items-center gap-1.5 border-b border-border pb-3">
                        <Sparkles className="w-5 h-5 text-primary animate-pulse" /> Kết quả chấm điểm AI
                    </h3>

                    {/* Vòng tròn điểm số */}
                    <div className="flex items-center gap-4">
                        <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-xl font-bold ${analysis.score >= 80 ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5' :
                            analysis.score >= 50 ? 'border-amber-500 text-amber-500 bg-amber-500/5' :
                                'border-destructive text-destructive bg-destructive/5'
                            }`}>
                            {analysis.score}%
                        </div>
                        <div>
                            <p className="text-foreground text-sm font-bold">
                                {analysis.score >= 80 ? 'Phát âm cực kỳ xuất sắc! 🎉' :
                                    analysis.score >= 50 ? 'Khá tốt! Nhưng vẫn cần luyện tập thêm.' :
                                        'Phát âm chưa chuẩn, hãy thử đọc lại chậm hơn.'}
                            </p>
                            <p className="text-muted-foreground text-xs mt-1">Hệ thống so sánh độ tương đồng âm học và ngữ nghĩa.</p>
                        </div>
                    </div>

                    {/* Đánh giá chi tiết từng từ */}
                    <div className="space-y-2">
                        <span className="text-muted-foreground text-[10px] font-bold tracking-wider block">CHI TIẾT PHÁT ÂM TỪNG TỪ:</span>
                        <div className="flex flex-wrap gap-2 p-4 bg-muted/20 rounded-xl border border-border/60">
                            {analysis.words.map((item, idx) => (
                                <span
                                    key={idx}
                                    className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-300 ${item.status === 'correct' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                                        item.status === 'incorrect' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                                            'bg-muted text-muted-foreground line-through decoration-destructive decoration-2'
                                        }`}
                                    title={item.status === 'correct' ? 'Đúng' : item.status === 'incorrect' ? 'Sai' : 'Thiếu'}
                                >
                                    {item.word}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Nhận xét & Gợi ý bản xứ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4 text-xs">
                        <div className="space-y-1.5">
                            <span className="text-muted-foreground font-semibold">Nhận xét chi tiết:</span>
                            <p className="text-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/40">{analysis.grammarFeedback}</p>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-muted-foreground font-semibold">Gợi ý cách nói bản xứ hơn:</span>
                            <p className="text-primary font-bold font-mono leading-relaxed bg-primary/5 p-3 rounded-lg border border-primary/20">{analysis.suggestion}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
