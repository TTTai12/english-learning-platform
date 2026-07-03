# 🏗️ KIẾN TRÚC & QUY TRÌNH VẬN HÀNH DỰ ÁN (ENGLISHAI)

Tài liệu này mô tả chi tiết cách tổ chức mã nguồn, luồng đi của dữ liệu giữa Frontend - Backend và quy trình chuẩn để phát triển một tính năng mới trong hệ thống **EnglishAI**.

---

## 📁 1. CẤU TRÚC THƯ MỤC CHUẨN (STANDARD STRUCTURE)

Dự án được tổ chức theo mô hình Monorepo đơn giản chia làm 2 thư mục độc lập: `client` (Frontend) và `server` (Backend).

### 🖥️ A. Thư mục Frontend (`/client/src/`)
Tổ chức code theo hướng phân rã trách nhiệm (Separation of Concerns) để đảm bảo các component có kích thước nhỏ gọn (dưới 150 dòng):

```
client/src/
├── types/
│   └── index.ts          # Định nghĩa kiểu dữ liệu TypeScript (Interfaces, Types) dùng chung.
├── constants/
│   └── [feature].ts      # Lưu các hằng số, mảng dữ liệu tĩnh (mock data, tenses, vocabulary).
├── services/
│   └── [feature].ts      # Các hàm gọi API thuần túy (fetch API hoặc Axios).
├── store/
│   └── use[Feature]Store.ts  # Zustand stores quản lý State toàn cục (Auth, XP, Level, Streaks).
├── components/
│   ├── ui/               # shadcn/ui components (Button, Progress, Dialog...) - KHÔNG sửa trực tiếp.
│   ├── layout/           # Các component bố cục (Sidebar, Header, MainLayout).
│   └── features/         # Các component con phục vụ cho từng trang cụ thể:
│       └── [feature]/    # Ví dụ: roadmap/OverallProgress.tsx, roadmap/TaskItem.tsx
├── pages/
│   └── [Feature].tsx     # Trang giao diện chính (chứa logic kết nối API và ráp các component con).
├── hooks/
│   └── use[Feature].ts   # Custom hooks chứa logic tương tác độc lập (ví dụ: SpeechRecognition).
├── lib/
│   └── queryClient.ts    # Cấu hình TanStack Query Client.
├── App.tsx               # Cấu hình định tuyến (React Router v7) và bọc các Providers.
└── main.tsx              # Điểm khởi đầu của ứng dụng React.
```

### 🗄️ B. Thư mục Backend (`/server/src/`)
Tổ chức theo mô hình MVC (Model - View - Controller) rút gọn (không có phần View vì Backend chỉ trả về JSON API):

```
server/src/
├── prisma/
│   └── schema.prisma     # Định nghĩa cấu trúc các bảng Database (MongoDB) và quan hệ.
├── routes/
│   └── [feature].ts      # Định nghĩa các endpoint (URLs) và gắn middleware xác thực.
├── controllers/
│   └── [feature]Controller.ts # Xử lý logic nghiệp vụ, truy vấn DB qua Prisma và trả về dữ liệu cho Client.
├── middleware/
│   ├── auth.ts           # Middleware giải mã Token JWT để nhận diện User (`verifyToken`).
│   └── error.ts          # Middleware bắt lỗi hệ thống (Global Error Handler).
├── services/
│   └── geminiService.ts  # Tương tác với các dịch vụ bên ngoài (Gemini AI API).
├── lib/
│   └── prisma.ts         # Khởi tạo thực thể Prisma Client kết nối với Database.
└── index.ts              # Điểm khởi đầu của Server Express, cấu hình middleware, kết nối port.
```

---

## 🔄 2. SƠ ĐỒ LUỒNG VẬN HÀNH DỮ LIỆU (DATA FLOW)

Luồng hoạt động khi Client hiển thị dữ liệu động từ Database (Ví dụ chặng học Roadmap):

```
[1. MongoDB Atlas] (Lưu trữ: User, Progress, Word)
        │
        ▼ (Prisma ORM truy vấn dữ liệu)
[2. Prisma Client]
        │
        ▼ (Controller tính toán, trả về JSON qua API)
[3. Express Controller] (Ví dụ: roadmapController.ts)
        │
        ▼ (HTTP Response: { completedTaskIds: [...] })
[4. API Service Layer] (client/src/services/)
        │
        ▼ (TanStack Query quản lý cache và trạng thái loading)
[5. useQuery] (client/src/pages/Roadmap.tsx)
        │
        ▼ (Destructuring dữ liệu và truyền props xuống)
[6. Subcomponents] (OverallProgress.tsx, TaskItem.tsx) ───► [7. JSX UI]
```

---

## 🛠️ 3. QUY TRÌNH 6 BƯỚC THÊM TÍNH NĂNG MỚI (STEP-BY-STEP)

Khi muốn thêm bất kỳ một tính năng mới nào (ví dụ: Sổ tay từ vựng cá nhân, Luyện nói...), em hãy tuân thủ nghiêm ngặt quy trình 6 bước sau:

### 📑 Bước 1: Thiết kế Database (Prisma Schema)
*   Mở file `server/src/prisma/schema.prisma`.
*   Định nghĩa Model mới (nếu cần) hoặc thêm trường dữ liệu vào Model cũ.
*   Chạy lệnh để đồng bộ cấu trúc database:
    ```bash
    npx prisma db push
    ```

### 🛣️ Bước 2: Tạo API Router & Controller ở Backend
*   Tạo file Controller trong `server/src/controllers/` để xử lý truy vấn database và thuật toán logic.
*   Tạo file Route trong `server/src/routes/` để ánh xạ đường dẫn URL vào hàm Controller tương ứng.
*   Khai báo Router mới vào file khởi chạy chính `server/src/index.ts`.

### 🏷️ Bước 3: Định nghĩa Interfaces ở Frontend
*   Mở file `client/src/types/index.ts`.
*   Khai báo các kiểu dữ liệu tương ứng với cấu trúc dữ liệu trả về từ API của Backend.

### 🌐 Bước 4: Viết API Service ở Frontend
*   Tạo hoặc cập nhật file gọi API trong thư mục `client/src/services/` để gọi Endpoint Backend đã viết ở Bước 2.

### 🧩 Bước 5: Phân rã Component & Thiết kế Component Con
*   Tạo thư mục tính năng tương ứng trong `client/src/components/features/[feature]/`.
*   Tách nhỏ giao diện thành các Component con (TaskItem, Card, Button...) với interface props rõ ràng, không viết dồn trong một file.

### 🗺️ Bước 6: Tạo trang chính (Pages) & Cấu hình Routes
*   Tạo trang chính trong thư mục `client/src/pages/[Feature].tsx`.
*   Sử dụng các hook `useQuery` / `useMutation` để lấy dữ liệu từ API Service và quản lý state.
*   Lắp ráp các Component con ở Bước 5 vào.
*   Đăng ký Route mới trong file `client/src/App.tsx`.

---

## ⚡ 4. CÁC NGUYÊN TẮC BẤT BIẾN KHI CODE (CODING LAWS)

1.  **Nguyên tắc 150 dòng:** Bất kỳ file component nào vượt quá 150 dòng bắt buộc phải thực hiện phân tách dữ liệu tĩnh hoặc tách component con.
2.  **Không dùng `any`:** Luôn định nghĩa kiểu dữ liệu tường minh bằng TypeScript. Sử dụng Utility Types (`Partial`, `Omit`, `Pick`) khi cần biến đổi kiểu.
3.  **Tách biệt logic:** State toàn cục dùng chung (Zustand Store), dữ liệu từ máy chủ (TanStack Query), dữ liệu tĩnh (Constants). Không lồng chéo logic vào nhau.
4.  **Presentation Component:** Component con chỉ lo hiển thị và nhận callback (ví dụ: `onAction`) qua Props, không chứa logic điều hướng trực tiếp của React Router hay gọi API.
