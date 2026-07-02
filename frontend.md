# 🚀 Sổ Tay Công Nghệ Front-End: EnglishAI (Tuần 1 - Tuần 4)

Tài liệu này tổng hợp toàn bộ các kỹ thuật, bài toán thực tế và kiến thức cốt lõi về **Front-End (React, TypeScript, Tailwind CSS, Zustand, TanStack Query)** tích lũy từ Tuần 1 đến Tuần 4 trong dự án EnglishAI. Đây là cẩm nang giúp bạn ôn luyện lý thuyết và thực hành để chuẩn bị cho các buổi phỏng vấn vị trí Front-End Developer.

---

## 📁 PHẦN 1: BUNDLER & RUNTIME ENVIRONMENT

### ❓ Tại sao chọn Vite thay vì Create React App (CRA) cho dự án?
*   **Create React App (CRA - Webpack):**
    *   CRA đóng gói toàn bộ mã nguồn của dự án (bundling) trước khi khởi động máy chủ thử nghiệm (dev server). 
    *   Khi dự án phình to, tốc độ khởi động (cold start) và tải lại khi thay đổi code (Hot Module Replacement - HMR) trở nên rất chậm chạp.
*   **Vite (Esbuild + Native ESM):**
    *   Sử dụng trình biên dịch **Esbuild** (viết bằng ngôn ngữ Go) có tốc độ biên dịch nhanh gấp 10 - 100 lần so với các công cụ viết bằng JavaScript.
    *   Chạy dev server dựa trên cơ chế **Native ES Modules (ESM)** của trình duyệt. Trình duyệt yêu cầu file nào, Vite biên dịch và trả về file đó tại chỗ (On-demand compilation), không tốn thời gian đóng gói cả dự án.
*   **Kết quả thực tế:** Tốc độ khởi động dev server của dự án EnglishAI giảm xuống dưới 1 giây và cập nhật giao diện (HMR) diễn ra tức thời.

---

## 🎨 PHẦN 2: TAILWIND CSS & CSS 3D ANIMATION

### 1. Bố cục Layout nâng cao (Flexbox vs Grid)
*   **Flexbox (`flex`):** Dùng để căn chỉnh các phần tử theo **một chiều** (hàng ngang hoặc cột dọc). Rất phù hợp cho thanh điều hướng (Navbar), thanh bên (Sidebar), hoặc căn giữa nút micro.
*   **Grid Layout (`grid`):** Dùng để chia bố cục theo **hai chiều** (cả dòng và cột). Rất thích hợp cho các trang hiển thị danh sách dạng bảng/thẻ như Dashboard, các Cấp độ Luyện nói (`grid-cols-1 md:grid-cols-3` tự động chuyển đổi từ 1 cột trên điện thoại sang 3 cột trên máy tính).

### 2. Thiết kế Animation 3D thuần (Vanilla CSS) không dùng thư viện
Để làm hiệu ứng lật thẻ bài Flashcard mượt mà và tối ưu hiệu năng phần cứng, ta ứng dụng 3 thuộc tính 3D cốt lõi:
1.  **`perspective`:** Tạo chiều sâu (độ xa gần) 3D cho thẻ cha.
2.  **`transform-style: preserve-3d`:** Ép các phần tử con (mặt trước và mặt sau) phải hiển thị trong không gian 3 chiều thay vì bị dẹt phẳng.
3.  **`backface-visibility: hidden`:** Ẩn mặt sau của phần tử khi nó quay lưng về phía người xem (giúp mặt trước không bị lộ ra khi thẻ quay 180 độ).

```css
/* Khung sườn lật thẻ bài */
.flashcard-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.flashcard-inner.is-flipped {
  transform: rotateY(180deg);
}
.flashcard-front, .flashcard-back {
  backface-visibility: hidden;
  position: absolute;
}
.flashcard-back {
  transform: rotateY(180deg);
}
```

---

## 🧠 PHẦN 3: REACT STATE & HOOKS MANAGEMENT

### 1. Phân biệt State và Derived State (Biến phái sinh)
> [!IMPORTANT]
> **Quy tắc vàng:** Đừng bao giờ lưu những giá trị có thể tính toán được từ state hiện tại vào một state mới.

*   **State:** Là nguồn dữ liệu gốc, thay đổi theo thời gian thông qua hành động của người dùng (ví dụ: mảng từ vựng `cards`, chỉ số thẻ hiện tại `currentIdx`).
*   **Derived State:** Là các giá trị được tính toán trực tiếp từ State gốc mỗi khi component re-render.
    *   *Ví dụ trong trang Flashcards:* Thẻ hiện tại `currentCard = cards[currentIdx]` và tiến độ phần trăm `progressPercent = ((currentIdx + 1) / cards.length) * 100`.
    *   *Lợi ích:* Code sạch hơn, không cần viết thêm `useEffect` để đồng bộ thủ công, tránh tối đa lỗi lệch dữ liệu (Out-of-sync) và giảm thiểu số lần re-render vô ích.

### 2. React `useRef` nâng cao
Khác với `useState` (gây re-render component mỗi khi giá trị thay đổi), `useRef` lưu trữ một giá trị tham chiếu tồn tại suốt vòng đời component mà không gây kích hoạt re-render.
*   **Ứng dụng trong trang Speaking:** Ta dùng `useRef` để quản lý thực thể `SpeechRecognition` của trình duyệt (`recognitionRef.current`) và bộ đếm thời gian im lặng (`silenceTimeoutRef.current`).
*   **Tránh lỗi rò rỉ bộ nhớ (Memory Leaks):** Nếu tạo micro trực tiếp trong component mà không dùng `useRef`, mỗi lần React cập nhật giao diện sẽ sinh ra một đối tượng micro mới chạy ngầm, gây đơ trình duyệt.

---

## 🔐 PHẦN 4: AUTHENTICATION & SECURITY (CLIENT-SIDE)

### 1. Luồng xác thực không trạng thái (Stateless Auth với JWT)
*   **JWT (JSON Web Token):** Không lưu trạng thái phiên đăng nhập trên RAM của server, giúp hệ thống dễ dàng mở rộng quy mô.
*   **Cơ chế lưu trữ và đính kèm ở Client:**
    1.  Sau khi đăng nhập thành công, client nhận token từ server và lưu vào `localStorage`.
    2.  Dùng **Persist Middleware** của thư viện Zustand để tự động khôi phục token và trạng thái đăng nhập mỗi khi người dùng tải lại trang (F5).
    3.  Đính kèm token vào Header `Authorization: Bearer <token>` thông qua các hàm tiện ích gọi API (Service) để truy cập các tài nguyên bảo mật trên server.

---

## ⚡ PHẦN 5: ĐỒNG BỘ DỮ LIỆU & CACHING (TANSTACK QUERY)

TanStack Query (React Query) giúp chuyển đổi cơ chế quản lý dữ liệu từ thủ công (dùng `useEffect` + `fetch`) sang tự động quản lý trạng thái máy chủ (Server State Management).

| Tính năng | `useQuery` | `useMutation` |
| :--- | :--- | :--- |
| **Mục đích** | Đọc dữ liệu (HTTP GET) | Thay đổi dữ liệu (POST, PUT, DELETE) |
| **Caching** | Tự động lưu cache, không gọi lại API nếu dữ liệu chưa hết hạn (staleTime) | Không lưu cache dữ liệu |
| **Trigger** | Tự động chạy khi component mount hoặc dependency key thay đổi | Chạy thủ công khi gọi hàm `.mutate()` hoặc `.mutateAsync()` |

### 🔄 Kỹ thuật Invalidation (Làm tươi dữ liệu)
Khi người dùng thực hiện một thay đổi (ví dụ: bấm Bookmark từ vựng):
1.  Client gửi yêu cầu thay đổi dữ liệu lên Server qua `useMutation`.
2.  Trong callback `onSuccess` của mutation, ta gọi lệnh:
    ```ts
    queryClient.invalidateQueries({ queryKey: ['vocabulary-list'] });
    ```
3.  React Query sẽ lập tức đánh dấu cache của key `vocabulary-list` là hết hạn và tự động kích hoạt gọi ngầm API lấy dữ liệu mới nhất từ database về cập nhật giao diện, giúp trải nghiệm người dùng liền mạch không cần tải lại trang.

---

## 🛡️ PHẦN 6: TYPESCRIPT BEST PRACTICES

### 1. Khắc phục lỗi TypeScript Strict Mode phổ biến
*   **Lỗi Implicit any (any ngầm định):** Xảy ra khi không định nghĩa kiểu cho tham số hoặc biến. 
    *   *Cách xử lý:* Định nghĩa rõ ràng các `interface` cho cấu trúc API trả về (ví dụ: `SpeakingAnalysisResponse`, `ExtractableCard`).
*   **TypeScript Generics (Kiểu dữ liệu tham số hóa):**
    Sử dụng Generics để định hình kiểu dữ liệu trả về cho TanStack Query:
    ```ts
    const { data } = useQuery<Word[]>({
        queryKey: ['words'],
        queryFn: fetchWords
    });
    // TypeScript sẽ tự động nhận biết 'data' là một mảng đối tượng kiểu Word[]
    ```
