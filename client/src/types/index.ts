// 1. Định nghĩa độ khó của từ vựng (Bạn đã viết chuẩn)
export type Difficulty = 'easy' | 'medium' | 'hard';

// 2. Định nghĩa cấu trúc một Từ Vựng (Bổ sung thêm trường độ khó và phiên âm)
export interface Word {
  id: string;
  word: string;         // Ví dụ: "Procrastinate"
  phonetic?: string;    // Phiên âm (Optional vì có từ có từ không) - Ví dụ: "/prəˈkræstɪneɪt/"
  meaning: string;      // Ví dụ: "Trì hoãn"
  definition?: string;  // Định nghĩa bằng tiếng Anh (Optional)
  example?: string;     // Câu ví dụ (Optional)
  topic: string;        // Chủ đề (Ví dụ: "Work", "School")
  difficulty: Difficulty; // Áp dụng Type Difficulty ở trên vào đây
  isSaved: boolean;     // Trạng thái đã lưu vào sổ tay chưa
}

// 3. Định nghĩa Tiến trình học tập (Bạn đã viết chuẩn)
export type LearningProgress = {
  streak: number;
  level: number;
  xp: number;
  badges: string[];
};

// 4. BỔ SUNG: Định nghĩa cho tính năng Flashcard AI (Dùng cho Tuần 2)
export interface Flashcard {
  id: string;
  wordId: string;
  frontContent: string; // Nội dung mặt trước (thường là từ tiếng Anh)
  backContent: string;  // Nội dung mặt sau (nghĩa + ví dụ)
  lastReviewed?: string; // Ngày review gần nhất (ISO date string)
  box: number;          // Hộp số mấy trong thuật toán Spaced Repetition (1-5)
}

// 5. BỔ SUNG: Định nghĩa cho tính năng Ngữ pháp / Mẫu câu (Dùng cho Tuần 2)
export interface GrammarTopic {
  id: string;
  title: string;        // Ví dụ: "Thì Hiện Tại Đơn"
  description: string;  // Mô tả ngắn về thì
  formula: string;      // Công thức cấu trúc câu
  examples: {
    sentence: string;
    translation: string;
  }[];                  // Mảng chứa các object câu ví dụ và dịch nghĩa
}

// Thêm interface này vào cuối file src/types/index.ts của bạn
export interface SavedWord {
  id: string;
  english: string;
  vietnamese: string;
  phonetic: string;
  example: string;
  topic: string;
  savedAt: Date;
  reviewCount: number;
  nextReview: Date;
}