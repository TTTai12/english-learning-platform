import { Sparkles } from 'lucide-react';
import type { SpeakingAnalysisResponse } from '../../../services/speaking';
import { ScoreRing } from './ScoreRing';

interface SpeechFeedbackProps {
  analysis: SpeakingAnalysisResponse;
}

export function SpeechFeedback({ analysis }: SpeechFeedbackProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs">
      <h3 className="text-foreground text-base font-bold flex items-center gap-1.5 border-b border-border pb-3">
        <Sparkles className="w-5 h-5 text-primary animate-pulse" /> Kết quả chấm điểm AI
      </h3>

      {/* Vòng tròn điểm số */}
      <div className="flex items-center gap-4">
        <ScoreRing score={analysis.score} />
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
              className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-300 ${
                item.status === 'correct'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : item.status === 'incorrect'
                  ? 'bg-destructive/10 text-destructive border border-destructive/20'
                  : 'bg-muted text-muted-foreground line-through decoration-destructive decoration-2'
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
          <p className="text-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/40">
            {analysis.grammarFeedback}
          </p>
        </div>
        <div className="space-y-1.5">
          <span className="text-muted-foreground font-semibold">Gợi ý cách nói bản xứ hơn:</span>
          <p className="text-primary font-bold font-mono leading-relaxed bg-primary/5 p-3 rounded-lg border border-primary/20">
            {analysis.suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}
