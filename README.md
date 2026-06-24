# 🇬🇧 EnglishAI - Nền tảng học tiếng Anh thông minh với AI

Chào mừng bạn đến với **EnglishAI**, một nền tảng học tiếng Anh toàn diện giúp học viên nâng cao vốn từ vựng, theo dõi tiến trình học tập hàng ngày và luyện tập qua các phương pháp học hiện đại (Flashcards, Spaced Repetition) với sự hỗ trợ của công nghệ AI.

Dự án này được chia làm hai phần chính:
*   **`client/` (Frontend):** Ứng dụng web React SPA viết bằng TypeScript, xây dựng trên Vite và tạo kiểu dáng bằng Tailwind CSS v4.
*   **`server/` (Backend):** Restful API viết bằng Express, Node.js, TypeScript và sử dụng Prisma ORM kết nối với cơ sở dữ liệu MongoDB.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### 1. Frontend (Client)
*   **Core:** React 18 (TypeScript) + Vite
*   **Styling:** Tailwind CSS v4 (sử dụng `@tailwindcss/vite` biên dịch cực nhanh)
*   **State Management:** Zustand (quản lý state đăng nhập và cấu hình ứng dụng)
*   **Routing:** React Router v7
*   **Components:** Shadcn UI (được tích hợp với Radix Primitives)
*   **Thư viện hỗ trợ:** Recharts (vẽ biểu đồ tiến trình học), Canvas Confetti (hiệu ứng chúc mừng)

### 2. Backend (Server)
*   **Core:** Node.js, Express (TypeScript)
*   **Database ORM:** Prisma ORM
*   **Database:** MongoDB (lưu trữ thông tin người dùng, từ vựng và tiến trình học tập)
*   **Xác thực bảo mật:** JSON Web Token (JWT) cho phiên đăng nhập, `bcryptjs` để băm mật khẩu bảo mật.

---

## ✨ Các tính năng chính

*   [x] **Xác thực bảo mật:** Đăng ký tài khoản mới, Đăng nhập và tự động khôi phục phiên hoạt động khi tải lại trang qua API `/api/auth/me`.
*   [x] **Theo dõi học tập (Gamification):** Hệ thống tích điểm kinh nghiệm (XP) và số ngày học liên tục (Streak) để khuyến khích học viên duy trì thói quen học tập.
*   [x] **Sổ tay từ vựng (Vocabulary Notebook):** Người dùng có thể lưu các từ vựng cần học vào sổ tay cá nhân.
*   [x] **Học từ vựng theo chủ đề:** Phân chia từ vựng theo chủ đề và mức độ khó dễ (`easy`, `medium`, `hard`).
*   [x] **Luyện tập qua Flashcards:** Giao diện thẻ ghi nhớ thông minh giúp ghi nhớ từ vựng lâu hơn qua phương pháp lặp lại ngắt quãng (Spaced Repetition).

---

## 📂 Cấu trúc thư mục dự án

```text
study english website/
├── client/                 # Mã nguồn Frontend (React + Vite + TS)
│   ├── src/
│   │   ├── components/     # Các UI Component dùng chung (Layout, UI)
│   │   ├── pages/          # Các màn hình chính (Dashboard, Flashcards, Vocab,...)
│   │   ├── store/          # Zustand stores quản lý State (Auth, App)
│   │   └── types/          # Định nghĩa kiểu TypeScript
├── server/                 # Mã nguồn Backend (Express + Prisma + TS)
│   ├── src/
│   │   ├── controllers/    # Hàm xử lý logic cho các API
│   │   ├── middleware/     # Middleware trung gian (ví dụ: verifyToken)
│   │   ├── prisma/         # Định nghĩa Schema Database (Prisma Schema)
│   │   ├── routes/         # Khai báo các đường dẫn API
│   │   └── index.ts        # File chạy chính của Backend
```

---

## 🚀 Hướng dẫn cài đặt và Chạy thử dự án

### Yêu cầu hệ thống (Prerequisites)
*   Đã cài đặt **Node.js** (Khuyên dùng bản LTS v18 trở lên).
*   Có tài khoản **MongoDB Atlas** (Online) hoặc cài đặt **MongoDB Community Server** (Offline) chạy trên cổng mặc định `27017`.

---

### Bước 1: Cấu hình và khởi chạy Backend (Server)

1.  Di chuyển terminal vào thư mục server và cài đặt các dependencies:
    ```bash
    cd server
    npm install
    ```

2.  Tạo file `.env` từ file mẫu `.env.example` (nếu chưa có):
    ```bash
    # Trên Windows (PowerShell)
    copy .env.example .env
    # Hoặc tự tạo file .env bằng tay
    ```

3.  Mở file `.env` lên và cấu hình chuỗi kết nối MongoDB của bạn cùng mã khóa JWT:
    ```env
    PORT=5000
    DATABASE_URL="mongodb://localhost:27017/englishai"
    JWT_SECRET="super_secret_jwt_key_english_ai_2026"
    ```

4.  Sinh mã client cho Prisma và đẩy cấu hình Schema lên MongoDB:
    ```bash
    npm run db:generate
    npm run db:push
    ```

5.  Khởi chạy server ở chế độ phát triển (Development):
    ```bash
    npm run dev
    ```
    *Server của bạn sẽ chạy tại:* `http://localhost:5000`

---

### Bước 2: Cài đặt và khởi chạy Frontend (Client)

1.  Mở một cửa sổ Terminal mới, di chuyển vào thư mục client và cài đặt:
    ```bash
    cd client
    npm install
    ```

2.  Khởi chạy Frontend ở chế độ phát triển:
    ```bash
    npm run dev
    ```
    *Ứng dụng client sẽ chạy tại:* `http://localhost:5173` hoặc `http://localhost:3000` (Theo dõi cổng hiển thị trong Terminal).

3.  Mở trình duyệt truy cập vào địa chỉ trên để bắt đầu trải nghiệm ứng dụng!

---

## 🔒 Tài liệu API (Auth Endpoints)

Hệ thống xác thực của Backend cung cấp các endpoint sau tại địa chỉ mặc định `http://localhost:5000/api/auth`:

| Endpoint | Method | Header yêu cầu | Request Body | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `/register` | `POST` | *None* | `{ email, password }` | Đăng ký tài khoản mới |
| `/login` | `POST` | *None* | `{ email, password }` | Đăng nhập tài khoản |
| `/me` | `GET` | `Authorization: Bearer <token>` | *None* | Lấy thông tin tài khoản hiện tại |

---

Chúc bạn có những trải nghiệm học tập và phát triển dự án tuyệt vời!
