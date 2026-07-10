# 🎓 EnglishAI — Nền tảng học tiếng Anh cá nhân hóa với AI

[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://render.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)

> Ứng dụng web full-stack giúp người dùng học từ vựng tiếng Anh thông minh hơn thông qua AI, Flashcards và luyện nói với nhận diện giọng nói thực tế.

🔗 **Live Demo:** [https://english-ai.vercel.app](https://english-learning-platform-lyart.vercel.app/)
📂 **Backend API:** [https://english-ai-server.onrender.com](https://english-learning-platform-6hm9.onrender.com)

---

## ✨ Tính năng nổi bật

| Tính năng | Mô tả |
|---|---|
| 🤖 **AI Flashcard Generator** | Dán văn bản bất kỳ — Gemini AI tự động bóc tách từ vựng, phiên âm, dịch nghĩa và phân loại độ khó |
| 🧠 **Spaced Repetition** | Thuật toán lặp lại ngắt quãng tự động tính chu kỳ ôn tập [1→3→7→14→30 ngày] theo lịch sử trả lời |
| 🎤 **AI Speaking Coach** | Luyện nói với Web Speech API, AI chấm điểm phát âm và chỉ ra lỗi sai cụ thể |
| 📚 **Vocab Notebook** | Sổ tay từ vựng cá nhân, bookmark từ yêu thích theo chủ đề |
| 🗺️ **Learning Roadmap** | Lộ trình học 4 giai đoạn có hệ thống, mở khóa dần theo tiến độ thực tế |
| 🔐 **JWT Authentication** | Đăng ký / Đăng nhập bảo mật, mã hóa mật khẩu bcrypt |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                     CLIENT (Vercel)                  │
│  React 18 + TypeScript + Tailwind CSS v4 + Vite      │
│  Zustand (Global State) + TanStack Query (Cache)     │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (JWT Auth)
┌──────────────────────▼──────────────────────────────┐
│                    SERVER (Render)                   │
│           Express 5 + TypeScript + Prisma ORM        │
│              JWT Authentication + bcryptjs           │
└──────────────────────┬──────────────────────────────┘
          ┌────────────┴────────────┐
          │                        │
┌─────────▼──────────┐   ┌─────────▼──────────┐
│  MongoDB Atlas     │   │    Gemini AI API    │
│  (Database)        │   │  (Google DeepMind)  │
└────────────────────┘   └────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (Dark/Light Mode)
- **State Management:** Zustand 5 (persist middleware)
- **Data Fetching:** TanStack Query v5 (caching, invalidation)
- **Routing:** React Router v6

### Backend
- **Runtime:** Node.js + Express 5
- **Language:** TypeScript (ESM)
- **ORM:** Prisma 6
- **Authentication:** JWT + bcryptjs
- **AI Integration:** Google Gemini API (`@google/generative-ai`)

### Database
- **DBMS:** MongoDB Atlas (Cloud)
- **Schema:** Prisma Schema (User, Word, Progress)

---

## 🗄️ Cấu trúc thư mục

```
study-english-website/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # UI Components tái sử dụng
│   │   ├── pages/             # Các trang chính
│   │   │   ├── Flashcards.tsx
│   │   │   ├── Speaking.tsx
│   │   │   ├── Vocabulary.tsx
│   │   │   ├── Grammar.tsx
│   │   │   └── Roadmap.tsx
│   │   ├── services/          # Hàm gọi API (fetch wrapper)
│   │   ├── store/             # Zustand stores
│   │   └── index.css          # Tailwind v4 theme config
│   └── package.json
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   │   ├── authController.ts
│   │   │   └── vocabController.ts
│   │   ├── routes/            # API route definitions
│   │   ├── middleware/        # Auth middleware (JWT verify)
│   │   └── lib/
│   │       └── prisma.ts      # Prisma client singleton
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── package.json
│
└── README.md
```

---

## 🚀 Hướng dẫn chạy dự án Local

### Yêu cầu môi trường
- Node.js >= 18
- MongoDB (Local hoặc MongoDB Atlas)
- Google Gemini API Key

### 1. Clone repository
```bash
git clone https://github.com/<your-username>/english-ai.git
cd english-ai
```

### 2. Cấu hình Backend
```bash
cd server
cp .env.example .env
```

Mở file `.env` và điền đầy đủ:
```env
DATABASE_URL="mongodb://localhost:27017/englishai"
JWT_SECRET="your_jwt_secret_key_here"
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=5000
```

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Cấu hình Frontend
```bash
cd ../client
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm install
npm run dev
```

✅ Frontend chạy tại: `http://localhost:5173`
✅ Backend chạy tại: `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới |
| `POST` | `/api/auth/login` | Đăng nhập, nhận JWT token |
| `GET` | `/api/auth/me` | Lấy thông tin user từ token |

### Vocabulary & Flashcards
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/api/vocab/topics` | Lấy danh sách chủ đề từ vựng | ✅ |
| `POST` | `/api/vocab/generate-flashcards` | AI tạo bộ thẻ từ văn bản | ✅ |
| `POST` | `/api/vocab/review` | Cập nhật kết quả ôn tập (SRS) | ✅ |
| `POST` | `/api/vocab/bookmark` | Lưu từ vào sổ tay cá nhân | ✅ |

### Speaking
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/api/speaking/analyze` | AI chấm điểm phát âm | ✅ |

---

## 🧩 Kỹ thuật nổi bật

### Spaced Repetition Algorithm
```typescript
// Chu kỳ ôn tập tăng dần nếu trả lời đúng
const intervals = [1, 3, 7, 14, 30]; // ngày
const nextInterval = intervals[Math.min(currentLevel, intervals.length - 1)];
const nextReview = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000);
```

### TanStack Query Caching
```typescript
// Cache dữ liệu từ vựng, tự động re-fetch khi stale
const { data } = useQuery({
  queryKey: ['vocab', topicId],
  queryFn: () => fetchWordsByTopic(topicId),
  staleTime: 5 * 60 * 1000, // 5 phút
});
```

---

## 👨‍💻 Tác giả

**[Tên của bạn]**
📧 Email: tientantai12@gmail.com
💼 LinkedIn: [linkedin.com/in/your-profile](https://www.linkedin.com/in/tai-tien-tan-a2227b323/)
🐙 GitHub: [github.com/your-username](https://github.com/TTTai12)

---

## 📄 License

MIT License — Free to use for learning and portfolio purposes.
