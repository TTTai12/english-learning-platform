// 1. Định nghĩa độ khó của từ vựng (Bạn đã viết chuẩn)
export type Difficulty = 'easy' | 'medium' | 'hard';

// 2. Định nghĩa cấu trúc một Từ Vựng (Bổ sung thêm trường độ khó và phiên âm)
export interface Word {
  id: string;
  english: string;      // Từ tiếng Anh (Database field)
  vietnamese: string;   // Nghĩa tiếng Việt (Database field)
  word?: string;        // Tương thích ngược với Mock data cũ
  meaning?: string;     // Tương thích ngược với Mock data cũ
  phonetic?: string;
  definition?: string;
  example?: string;
  topic: string;
  difficulty: Difficulty;
  isSaved: boolean;
  isBookmarked?: boolean;
  isLearned?: boolean;
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
}// Thêm vào cuối file client/src/types/index.ts

export interface RoadmapTask {
  id: string;
  label: string;
  desc: string;
  section?: string; // Tên route chuyển trang
  xpReward: number;
  tag?: string;
}

export interface RoadmapPhase {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  duration: string;
  icon: string;
  color: string;
  borderColor: string;
  badgeColor: string;
  lineColor: string;
  tasks: RoadmapTask[];
  unlockAfter?: number;
}

export interface VocabularyTopic {
  id: string;
  name: string;
  icon: string;
  wordCount: number;
  learnedCount: number;
  color: string;
  borderColor: string;
  iconBg: string;
}

export interface ExtractableCard {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  topic: string;
  difficulty: Difficulty;
  isSaved: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  icon: string;
  systemInstruction: string;
  firstMessage: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  translation?: string;
}
