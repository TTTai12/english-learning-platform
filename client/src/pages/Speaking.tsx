import { useState } from 'react';
import { Mic, MicOff, Volume2, ChevronLeft, Award } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { analyzeSpeakingSpeech, type SpeakingAnalysisResponse } from '../services/speaking';
import { fetchWordsByDifficulty } from '../services/vocab';
import { useAuthStore } from '../store/useAuthStore';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { SpeechFeedback } from '../components/features/speaking/SpeechFeedback';
import { defaultMockExercises } from '../constants/speaking';

type DifficultyType = 'easy' | 'medium' | 'hard';

export default function SpeakingPage() {
  const [difficulty, setDifficulty] = useState<DifficultyType>('easy');
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [analysis, setAnalysis] = useState<SpeakingAnalysisResponse | null>(null);

  const { data: dbWords, isLoading: isFetching } = useQuery({
    queryKey: ['speaking-exercises', difficulty],
    queryFn: () => fetchWordsByDifficulty(difficulty),
  });

  const exercises = dbWords && dbWords.length > 0
    ? dbWords.map((w: any) => ({
        id: w.id,
        english: w.english,
        vietnamese: w.vietnamese,
        example: w.example || w.english,
      }))
    : defaultMockExercises[difficulty];

  const analyzeMutation = useMutation({
    mutationFn: ({ targetPhrase, userSpeech }: { targetPhrase: string; userSpeech: string }) =>
      analyzeSpeakingSpeech(targetPhrase, userSpeech),
    onSuccess: (data: any) => {
      setAnalysis(data);
      if (data?.user) {
        useAuthStore.setState({ user: data.user });
      }
    },
    onError: () => {
      alert('Không thể kết nối với AI để chấm điểm nói.');
    }
  });

  const { isListening, transcript, toggleListening } = useSpeechRecognition({
    onResult: (resultText) => {
      if (selectedExercise) {
        analyzeMutation.mutate({
          targetPhrase: selectedExercise.example,
          userSpeech: resultText
        });
      }
    }
  });

  const handlePlayAudio = (phrase: string) => {
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (!selectedExercise) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight">Luyện nói với AI</h2>
          <p className="text-muted-foreground text-sm">AI phân tích phát âm và chỉ ra chính xác lỗi của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['easy', 'medium', 'hard'] as const).map((level) => {
            const labels = { easy: { label: 'Cơ bản', desc: 'Phát âm câu từ đơn giản', icon: '🌱' },
                             medium: { label: 'Trung cấp', desc: 'Câu giao tiếp thông dụng', icon: '🌿' },
                             hard: { label: 'Nâng cao', desc: 'Đoạn hội thoại phức tạp', icon: '🌳' } };
            return (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                  difficulty === level ? 'border-primary/80 bg-primary/5 ring-1 ring-primary/80' : 'border-border bg-card/40 hover:bg-card/75'
                }`}
              >
                <span className="text-2xl mt-1">{labels[level].icon}</span>
                <div>
                  <p className="text-foreground font-bold text-sm">{labels[level].label}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{labels[level].desc}</p>
                </div>
              </button>
            );
          })}
        </div>

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => { setSelectedExercise(null); setAnalysis(null); }}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> Chọn bài khác
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-foreground text-xl font-bold font-mono tracking-wide leading-relaxed pr-8">
              {selectedExercise.example}
            </h1>
            {selectedExercise.vietnamese && (
              <p className="text-muted-foreground text-xs">
                Từ khóa học: {selectedExercise.english} ({selectedExercise.vietnamese})
              </p>
            )}
          </div>
          <button
            onClick={() => handlePlayAudio(selectedExercise.example)}
            className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/15 transition-colors cursor-pointer absolute right-6 top-6"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <div className="border-t-2 border-dashed border-border/80 w-full my-6"></div>

        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <button
            onClick={toggleListening}
            className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2.5 transition-all duration-300 shadow-md cursor-pointer ${
              isListening ? 'bg-destructive text-destructive-foreground animate-pulse scale-105' : 'bg-primary text-primary-foreground hover:scale-105'
            }`}
          >
            {isListening ? (
              <><MicOff className="w-5 h-5 animate-bounce" /> Đang nghe... Dừng nói</>
            ) : (
              <><Mic className="w-5 h-5" /> Bắt đầu nói</>
            )}
          </button>
          <span className="text-xs text-muted-foreground">
            {isListening ? 'Hãy nói to rõ ràng vào mic điện thoại/máy tính của bạn' : 'Nhấn nút ghi âm để bắt đầu'}
          </span>
        </div>

        {transcript && (
          <div className="bg-muted/30 p-4 rounded-xl border border-border/80 space-y-2">
            <span className="text-muted-foreground text-[10px] font-bold tracking-wider block">BẠN ĐÃ NÓI:</span>
            <p className="text-foreground text-sm font-semibold italic">"{transcript}"</p>
          </div>
        )}
      </div>

      {analyzeMutation.isPending && (
        <div className="bg-card border border-border rounded-2xl p-6 text-center text-sm text-muted-foreground animate-pulse">
          Đang gửi dữ liệu phân tích phát âm sang AI chấm điểm...
        </div>
      )}

      {analysis && <SpeechFeedback analysis={analysis} />}
    </div>
  );
}
