# 🚀 Cẩm Nang Phỏng Vấn: Kiến Thức Thực Tế Dự Án EnglishAI
Tài liệu này được biên soạn dưới dạng **các câu hỏi phỏng vấn thực tế** dựa trên chính những kỹ thuật, bài toán và lỗi mà bạn đã tự tay xử lý trong dự án. Điều này giúp bạn tự tin trả lời các nhà tuyển dụng khi đi phỏng vấn.

---

## 📌 PHẦN 1: FRONTEND & REACT PERFORMANCE (TUẦN 1 & 2)

### ❓ Câu 1: Tại sao bạn lại chọn Vite thay vì Create React App (CRA) cho dự án?
*   **Trả lời phỏng vấn:** 
    *   CRA sử dụng Webpack để đóng gói toàn bộ ứng dụng trước khi chạy dev server. Khi dự án lớn lên, tốc độ khởi động và reload cực kỳ chậm.
    *   Vite sử dụng cơ chế **ES Modules native** của trình duyệt kết hợp với công cụ biên dịch **Esbuild** (viết bằng Go) để chạy dev server gần như lập tức. Nó chỉ compile file nào được trình duyệt yêu cầu thay vì bundle cả dự án.
*   **Kinh nghiệm thực tế:** Khởi động dự án và hot-reload ở client chỉ mất dưới 1 giây, tăng hiệu suất code rõ rệt.

### ❓ Câu 2: Phân biệt State (Trạng thái) và Derived State (Biến phái sinh) trong React? Tại sao không nên đặt mọi thứ vào `useState`?
*   **Trả lời phỏng vấn:** 
    *   **State** là nguồn dữ liệu gốc, thay đổi theo tương tác của người dùng (như `currentIdx` hoặc danh sách `cards`).
    *   **Derived State** là những giá trị được tính toán trực tiếp từ State hiện tại mỗi khi component re-render (ví dụ: `currentCard = cards[currentIdx]` hay `progressPercent`).
    *   Nếu ta đưa `currentCard` vào một `useState` riêng, ta sẽ phải đồng bộ nó một cách thủ công mỗi khi `currentIdx` thay đổi qua `useEffect`. Điều này gây ra dư thừa dữ liệu, tăng số lần re-render và dễ sinh ra lỗi không đồng bộ (Out-of-sync state).
*   **Kinh nghiệm thực tế:** Trong trang `Flashcards.tsx`, biến `currentCard` được tính toán trực tiếp từ `cards[currentIdx]` giúp code cực kỳ sạch và tối ưu hiệu năng.

### ❓ Câu 3: Làm thế nào bạn tạo được hiệu ứng lật thẻ bài 3D (Flashcard) mà không dùng thư viện bên ngoài?
*   **Trả lời phỏng vấn:** Em sử dụng **Vanilla CSS** với 3 thuộc tính 3D cốt lõi:
    1.  `perspective`: Thiết lập độ sâu 3D cho thẻ cha.
    2.  `transform-style: preserve-3d`: Bắt buộc các phần tử con (mặt trước và mặt sau) phải hiển thị trong không gian 3D.
    3.  `backface-visibility: hidden`: Ẩn đi mặt sau của phần tử khi nó quay lưng về phía người xem.
    *   Khi người dùng nhấn lật, em chỉ cần toggle class để xoay card parent `rotateY(180deg)`.

---

## 📌 PHẦN 2: BACKEND & DATABASE ARCHITECTURE (TUẦN 3)

### ❓ Câu 4: Tại sao bạn sử dụng JWT (JSON Web Token) cho hệ thống Auth? JWT hoạt động thế nào và lưu trữ ở đâu an toàn?
*   **Trả lời phỏng vấn:** 
    *   JWT là cơ chế xác thực **Stateless** (không lưu phiên đăng nhập trên RAM server). Server chỉ cần dùng thuật toán mã hóa để ký và xác thực token, giúp server dễ mở rộng (scale) mà không cần đồng bộ session.
    *   **Cơ chế:** Khi đăng nhập thành công, Server ký token chứa `userId` gửi về client. Client đính kèm nó vào Header `Authorization: Bearer <token>` mỗi khi gọi API cần bảo mật.
    *   **Lưu trữ:** Trong dự án, em lưu JWT trong `localStorage` kết hợp với tính năng `persist` của Zustand để tự động duy trì phiên làm việc khi F5. Nếu phỏng vấn hỏi sâu về bảo mật (XSS, CSRF), có thể đề xuất lưu trong **HttpOnly Cookie** để ngăn chặn mã độc JS đọc được token.

### ❓ Câu 5: Tại sao Prisma ORM yêu cầu MongoDB phải chạy ở chế độ Replica Set (Nhóm sao lưu)? Bạn đã xử lý lỗi này thế nào?
*   **Trả lời phỏng vấn:** 
    *   MongoDB mặc định khi cài trên local chạy ở chế độ đơn lẻ (Standalone) nên không hỗ trợ **Transactions (Giao dịch)**.
    *   Tuy nhiên, Prisma ORM yêu cầu tính năng Transaction này để thực hiện các thao tác viết dữ liệu phức tạp đảm bảo tính toàn vẹn (như hàm `upsert` cập nhật tiến trình học từ vựng).
*   **Kinh nghiệm thực tế:** Em đã khắc phục bằng cách chuyển đổi cấu hình file `.env` từ MongoDB Local sang **MongoDB Atlas** đám mây miễn phí, vì Atlas mặc định được cấu hình chạy dưới dạng Replica Set sẵn, giải quyết triệt để lỗi `P2031 (Prisma needs a Replica Set)`.

---

## 📌 PHẦN 3: ĐỒNG BỘ DỮ LIỆU & ĐỒNG THỜI (TUẦN 4)

### ❓ Câu 6: Phân biệt `useQuery` và `useMutation` trong TanStack Query (React Query)?
*   **Trả lời phỏng vấn:** 
    *   `useQuery`: Dùng để đọc dữ liệu (HTTP GET). Nó tự động quản lý cache, tự động fetch lại khi cửa sổ trình duyệt focus hoặc khi key thay đổi.
    *   `useMutation`: Dùng để ghi hoặc thay đổi dữ liệu (HTTP POST/PUT/DELETE). Nó không tự động cache mà cung cấp các callback hữu ích như `onSuccess` để xử lý sau khi cập nhật thành công.
*   **Kinh nghiệm thực tế:** Em dùng `useMutation` để đánh dấu từ vựng đã học. Khi mutation thành công, em gọi `queryClient.invalidateQueries` để xóa cache cũ của trang Từ vựng, bắt buộc React Query kéo dữ liệu mới nhất về hiển thị mà không cần người dùng tải lại trang.

### ❓ Câu 7: Khi nào dùng `.getState()` thay vì dùng Hook Selector của Zustand?
*   **Trả lời phỏng vấn:** 
    *   **Hook Selector (`useAuthStore(state => state.token)`)** được thiết kế để dùng bên trong React Component. Nó đăng ký lắng nghe thay đổi, nếu `token` đổi thì component re-render.
    *   **`.getState()` (`useAuthStore.getState().token`)** được thiết kế để lấy giá trị tức thời từ store **ở bên ngoài React** (như trong các file JavaScript helper, api services). Do các file này không phải là React Component nên không thể sử dụng Hook (sẽ bị lỗi vi phạm Rules of Hooks).
*   **Kinh nghiệm thực tế:** Em dùng `useAuthStore.getState().token` trong hàm `getHeaders()` của file `services/grammar.ts` để đính kèm token vào request HTTP mà không cần khởi tạo React hook.

### ❓ Câu 8: Thuật toán Spaced Repetition (SM-2) trong dự án của bạn hoạt động thế nào?
*   **Trả lời phỏng vấn:** Em đã thiết kế thuật toán lưu lịch ôn tập dựa trên mức độ thuộc bài của người học:
    *   Khi người dùng nhớ đúng (`isCorrect: true`), số lần nhớ liên tiếp (`reviewCount`) tăng lên, khoảng cách ngày ôn tập tiếp theo tăng theo cấp số nhân (dựa trên mảng giãn cách `[1, 3, 7, 14, 30]` ngày).
    *   Khi người dùng quên từ (`isCorrect: false`), lập tức reset `reviewCount = 0` và xếp lịch ôn vào ngày mai (1 ngày) để củng cố lại trí nhớ.
    *   Học liệu được cập nhật qua API `POST /api/vocabulary/review/:wordId` và lưu lịch ôn `nextReview` cụ thể dưới database.

---

## 📌 PHẦN 4: KHẮC PHỤC LỖI THỰC TẾ (TROUBLESHOOTING)

### ❓ Câu 9: Kể tên một số lỗi biên dịch TypeScript Strict Mode bạn đã gặp và cách xử lý?
*   **Trả lời phỏng vấn:** 
    *   **Lỗi `Implicit any` (any ngầm định):** Khi khai báo biến hoặc tham số hàm mà không chỉ định kiểu dữ liệu. Em đã xử lý bằng cách khai báo kiểu rõ ràng hoặc sử dụng **TypeScript Generics** trong React Query, ví dụ: `useQuery<Word[]>` để định hình chính xác cấu trúc dữ liệu trả về từ API.
    *   **Lỗi `Cannot redeclare block-scoped variable`:** Xảy ra khi vô tình khai báo trùng tên biến trong cùng một block code (như khai báo trùng biến `xp`, `streak` lấy từ `useAppStore` và `useAuthStore` trong file `DashboardSection.tsx`). Em xử lý bằng cách dọn dẹp và xóa bỏ hoàn toàn các dòng import và khai báo biến cũ không sử dụng.
