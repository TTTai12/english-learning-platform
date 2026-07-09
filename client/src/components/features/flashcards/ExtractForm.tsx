import { FileText, Loader2, Sparkles } from 'lucide-react';
import { sampleTexts } from '../../../constants/flashcards';

interface ExtractFormProps {
  text: string;
  setText: (text: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
}

export function ExtractForm({ text, setText, isLoading, onGenerate }: ExtractFormProps) {
  return (
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
            onClick={onGenerate}
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

      {/* HƯỚNG DẪN BẰNG GRID */}
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
  );
}
