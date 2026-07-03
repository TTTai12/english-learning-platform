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

### 3. Chỉ thị `@apply` trong Tailwind CSS & Custom Config
*   **Chỉ thị `@apply`:**
    *   Cho phép ta viết mã CSS sạch bằng cách lồng các tiện ích Tailwind trực tiếp vào các class tự chọn trong file CSS (ví dụ: `index.css`).
    *   *Ứng dụng:* Giúp tái sử dụng các tổ hợp class Tailwind dài, tránh việc lặp đi lặp lại hàng chục class inline trong các thẻ JSX (như nút bấm, thẻ bài).
    ```css
    .btn-primary {
      @apply px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all;
    }
    ```
*   **Custom Configuration & Complex Animation:**
    *   Cấu hình trong file `tailwind.config.js` để mở rộng hệ màu sắc thương hiệu, bo góc, và định nghĩa các hiệu ứng chuyển động phức tạp.
    *   *Ví dụ cấu hình Keyframes lơ lửng (Floating) cho mic speaking:*
        ```js
        theme: {
          extend: {
            keyframes: {
              float: {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-6px)' },
              }
            },
            animation: {
              float: 'float 3s ease-in-out infinite',
            }
          }
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

### 3. Tối ưu hiệu năng bằng `useMemo` & `useCallback`
*   **`useMemo` (Ghi nhớ giá trị tính toán):**
    *   Tránh tính toán lại các logic phức tạp (nặng) ở mỗi lần re-render nếu các biến phụ thuộc (dependencies) không thay đổi.
    *   *Ví dụ:* Tính toán lọc danh sách từ vựng theo độ khó và chủ đề.
    ```ts
    const filteredWords = useMemo(() => {
        return words.filter(w => w.topic === activeTopic && w.difficulty === level);
    }, [words, activeTopic, level]); // Chỉ tính toán lại khi mảng words, activeTopic hoặc level thay đổi
    ```
*   **`useCallback` (Ghi nhớ tham chiếu hàm):**
    *   Tránh việc định nghĩa lại (re-create) các hàm xử lý sự kiện ở mỗi lần re-render, giữ nguyên **định danh tham chiếu (reference identity)** của hàm để tránh re-render vô ích cho component con nhận hàm đó làm prop.
    ```ts
    const handlePlayAudio = useCallback((text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }, []); // Hàm này chỉ được tạo 1 lần duy nhất trong vòng đời component
    ```

### 4. React Suspense cơ bản
*   **Khái niệm:** Cho phép bao bọc các component tải chậm (như lazy loading component hoặc các component đang đợi tải dữ liệu) và hiển thị một giao diện chờ tạm thời (Loading Indicator/Skeleton) trong lúc chờ đợi.
*   **Ứng dụng:** 
    ```tsx
    import React, { Suspense } from 'react';
    const LazyRoadmap = React.lazy(() => import('./pages/Roadmap'));

    function App() {
      return (
        <Suspense fallback={<div className="loading">Đang tải chặng bay...</div>}>
          <LazyRoadmap />
        </Suspense>
      );
    }
    ```

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

### 2. TypeScript Nâng Cao: Mapped Types & Conditional Types
*   **Mapped Types (Kiểu ánh xạ):**
    *   Cho phép ta tạo ra các kiểu dữ liệu mới bằng cách duyệt qua các thuộc tính của một kiểu dữ liệu cũ (tương tự vòng lặp `.map()` của mảng nhưng áp dụng cho Type).
    *   *Ví dụ thực tế:* Biến đổi tất cả các thuộc tính của interface `Word` thành dạng chỉ đọc (Readonly) hoặc tùy chọn (Optional).
    ```ts
    type ReadonlyWord<T> = {
      readonly [P in keyof T]: T[P];
    };
    // Sử dụng: const word: ReadonlyWord<Word> = { ... }; // Không thể gán lại các thuộc tính của word
    ```
*   **Conditional Types (Kiểu điều kiện):**
    *   Cho phép ta chọn một kiểu dữ liệu dựa trên một điều kiện logic (tương tự toán tử ba ngôi `condition ? true : false` nhưng ở cấp độ Type).
    *   *Ví dụ thực tế:* Định hình kiểu dữ liệu trả về của API dựa trên việc truyền vào tham số cụ thể.
    ```ts
    type IsString<T> = T extends string ? true : false;
    type A = IsString<string>; // Type A là true
    type B = IsString<number>; // Type B là false
    ```

---

## 🤖 PHẦN 7: TÍCH HỢP AI & STREAMING RESPONSE (TASK 5.3)

Trong trang **Hội thoại mô phỏng**, ta tích hợp tính năng chat thời gian thực với trợ lý AI bằng cơ chế truyền nhận dữ liệu dòng chảy (Streaming) tương tự ChatGPT.

### 1. Cơ chế truyền dữ liệu dòng chảy (Streaming Response)
*   **Vấn đề thực tế:** AI cần 3-5 giây để suy nghĩ và viết xong câu trả lời. Nếu bắt người dùng chờ tải xong cả câu mới hiển thị, trải nghiệm sẽ rất chậm chạp.
*   **Giải pháp (Chunked Transfer Encoding):**
    *   Server thiết lập Header `Transfer-Encoding: chunked`.
    *   Gemini AI sinh ra từ nào, Server lập tức đẩy mảnh dữ liệu (chunk) đó về Client ngay thông qua kết nối HTTP mở.
*   **Cách Frontend đọc dòng chảy dữ liệu:**
    1.  Sử dụng `fetch` API để nhận kết quả dạng `ReadableStream`.
    2.  Khởi tạo `const reader = response.body.getReader()` để mở cổng đọc.
    3.  Dùng vòng lặp `while (true)` liên tục gọi `await reader.read()` để đón nhận từng mảnh dữ liệu nhị phân (`value`) cho đến khi `done === true`.
    4.  Sử dụng `TextDecoder` giải mã dữ liệu nhị phân thành chữ thường (`string`) và cộng dồn vào state giao diện.

### 2. Trải nghiệm mượt mà với Optimistic UI Update
*   **Định nghĩa:** Cập nhật trạng thái giao diện tức thời trước khi API phản hồi để tạo cảm giác ứng dụng phản hồi siêu tốc.
*   **Ứng dụng trong Chat:**
    1.  Khi người dùng bấm gửi, lập tức push tin nhắn của User vào state `messages`.
    2.  Đồng thời, tạo trước một tin nhắn "rỗng" của AI với một ID tạm thời (ví dụ: `aiPlaceholderId`).
    3.  Trong quá trình đọc stream, ta dùng hàm `.map()` để tìm đúng tin nhắn có ID tạm thời đó và ghi đè dữ liệu chữ mới chảy về, giúp chữ hiển thị chạy dần ra tại đúng khung bong bóng của AI.

### 3. Tự động cuộn trang (Auto-scroll) & Trình duyệt đọc tiếng Anh (TTS)
*   **Auto-scroll:**
    *   Sử dụng `useRef<HTMLDivElement>` trỏ vào một thẻ `div` trống nằm ở cuối cùng của khung chat.
    *   Dùng `useEffect` lắng nghe sự thay đổi của mảng `messages`. Mỗi khi có tin nhắn mới hoặc chữ đang stream chạy ra, gọi lệnh:
        ```ts
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        ```
*   **Text-to-Speech (TTS):**
    *   Sử dụng Web Speech API có sẵn của trình duyệt thông qua lớp `SpeechSynthesisUtterance`.
    *   Khi người dùng click vào biểu tượng loa, gọi hàm:
        ```ts
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
        ```

### ❓ Câu hỏi phỏng vấn thường gặp
*   **Q: Tại sao dùng Fetch thay vì Axios khi làm chat Streaming?**
    *   *Trả lời:* Axios mặc định xử lý response dưới dạng toàn bộ bộ đệm (buffered response) và việc cấu hình đọc stream bằng Axios trên môi trường trình duyệt rất phức tạp (đòi hỏi xử lý adapter thô). Trong khi đó, Fetch API hỗ trợ native đối tượng `ReadableStream` thông qua `response.body`, giúp việc chia nhỏ dữ liệu và đọc từng chunk cực kỳ đơn giản và hiệu năng cao.
*   **Q: Làm thế nào để phân tách câu trả lời tiếng Anh và câu dịch tiếng Việt đi kèm trong cùng một dòng chảy stream?**
    *   *Trả lời:* Ta cấu hình ở System Prompt yêu cầu AI trả về nội dung theo quy tắc phân tắc đặc biệt, ví dụ: `[Câu tiếng Anh] \nvn: [Câu dịch tiếng Việt]`. Ở Frontend, khi nhận được chuỗi chữ cộng dồn, ta dùng hàm `.split(/vn: |\\nvn: /)` để tách chuỗi tại điểm neo phân tách. Phần tử đầu tiên là câu tiếng Anh hiển thị chính, phần tử thứ hai là câu dịch hiển thị nhỏ ở dưới.

---

## 🗺️ PHẦN 8: LỘ TRÌNH HỌC TẬP & TIẾN ĐỘ THỰC TẾ (TASK 5.4)

Trong trang **Lộ trình học tập (Roadmap)**, ta thiết lập sơ đồ tuyến tính 4 giai đoạn biểu diễn quá trình học từ vựng và kỹ năng. Tiến trình được liên kết trực tiếp với dữ liệu thật trong Database thông qua API thống kê động.

### 1. Kỹ thuật truy vấn Gom nhóm & Tính toán động (Calculated Fields)
*   **Vấn đề thực tế:** Nếu ta lưu sẵn trường `isCompleted` của từng nhiệm vụ vào bảng của User trong DB, ta sẽ phải liên tục cập nhật trường này mỗi khi user học thuộc một từ vựng mới hoặc lưu flashcard. Việc này dễ dẫn đến không đồng bộ dữ liệu (Out-of-sync) và phình to dung lượng DB.
*   **Giải pháp (Computed Fields tại thời điểm gọi API):**
    *   Khi client gọi API `/api/roadmap`, Backend sẽ truy vấn bảng `Progress` của user lọc theo điều kiện (`isLearned: true`, `isBookmarked: true`) kèm theo dữ liệu liên kết từ bảng `Word` (`include: { word: true }`).
    *   Backend tự động đếm số từ đã học theo từng chủ đề (`dailyLearned`, `businessLearned`, `travelLearned`...) bằng hàm `.filter()` trên mảng.
    *   Tự động so khớp tiến độ thực tế với các cột mốc:
        *   Nhiệm vụ 1.1 hoàn thành khi: `dailyLearned >= 2`.
        *   Nhiệm vụ 1.4 hoàn thành khi: Có ít nhất một từ có `reviewCount > 0` (đã nói thử với AI).
        *   Nhiệm vụ 1.5 hoàn thành khi: Có ít nhất một từ được bookmark (`isBookmarked: true`).
    *   Trả về mảng `completedTaskIds` cho Frontend. Giao diện sẽ hoàn toàn chính xác theo thời gian thực và không bao giờ bị lệch dữ liệu.

### 2. Định dạng Cấu trúc Dữ liệu Tra cứu Nhanh với `Set`
*   Để kiểm tra xem một nhiệm vụ có ID là `t1-1` đã hoàn thành hay chưa trong quá trình vẽ giao diện:
    *   Nếu ta dùng mảng thông thường và gọi hàm `data.completedTaskIds.includes('t1-1')`, độ phức tạp thuật toán sẽ là $O(N)$ (phải duyệt qua toàn bộ mảng để tìm kiếm).
    *   **Giải pháp tối ưu:** Chuyển đổi mảng thành cấu trúc dữ liệu **`Set`** trong Javascript:
        ```ts
        const completedTasks = new Set<string>(data?.completedTaskIds || []);
        ```
        Khi duyệt qua danh sách các chặng bay ở giao diện, ta kiểm tra bằng hàm `completedTasks.has(task.id)`. Độ phức tạp lúc này chỉ còn là **$O(1)$** (tra cứu trực tiếp cực nhanh, tối ưu hóa tối đa hiệu năng render của React).

### ❓ Câu hỏi phỏng vấn thường gặp
*   **Q: Sự khác nhau giữa `useNavigate` và thẻ `<Link>` của react-router-dom là gì?**
    *   *Trả lời:* 
        *   Thẻ `<Link>` dùng để khai báo liên kết điều hướng trực tiếp trên cây JSX (tương tự thẻ `<a>` nhưng ngăn chặn load lại toàn bộ trang web).
        *   `useNavigate` là một hook dùng để điều hướng bằng lập trình (imperative navigation) bên trong các hàm xử lý sự kiện (event handlers) hoặc trong `useEffect` (ví dụ: chuyển trang sau khi gọi API thành công hoặc click button).
*   **Q: Tại sao trong Roadmap này ta lại chuyển trạng thái Checkbox sang chế độ Read-only (chỉ hiển thị) thay vì cho phép click để đổi state?**
    *   *Trả lời:* Vì đây là lộ trình học tập đồng bộ thực tế dựa trên dữ liệu thật từ DB. Trạng thái hoàn thành của nhiệm vụ phản ánh đúng năng lực và tiến độ học thật của học viên (như số từ đã thuộc, số lần luyện nói). Việc chuyển sang read-only giúp ngăn chặn người dùng tự bấm "hoàn thành khống" nhiệm vụ mà không cần học.

### 3. Kiến trúc Phân rã Component & Code Splitting (SRP)
*   **Vấn đề thực tế:** Trang `Roadmap.tsx` ban đầu chứa tới gần 500 dòng code do lồng mảng dữ liệu tĩnh `phases` khổng lồ, khai báo interface và vẽ toàn bộ UI trong một file duy nhất. Điều này khiến code cực kỳ khó bảo trì và vi phạm nguyên tắc Đơn nhiệm (Single Responsibility Principle - SRP).
*   **Giải pháp cấu trúc hóa:**
    1.  **Constants Separation:** Chuyển mảng dữ liệu tĩnh `phases` và từ điển màu sắc `tagColors` sang file `client/src/constants/roadmap.ts`.
    2.  **Shared Types:** Tập trung định nghĩa các interface `RoadmapTask` và `RoadmapPhase` tại file kiểu dữ liệu chung `client/src/types/index.ts`.
    3.  **Subcomponents Splitting:** Tách các khối giao diện có nhiệm vụ độc lập ra các file riêng biệt nằm trong thư mục `client/src/components/features/roadmap/`:
        *   `OverallProgress.tsx`: Chịu trách nhiệm hiển thị thanh tiến độ tổng thể và 4 chấm tròn mini indicator.
        *   `TaskItem.tsx`: Chịu trách nhiệm hiển thị chi tiết một dòng nhiệm vụ, bao gồm checkbox, tag badge và nút "Bắt đầu".
    4.  **Clean Page Assembly:** File chính `Roadmap.tsx` lúc này chỉ còn **219 dòng**, tập trung hoàn toàn vào việc gọi API lấy tiến độ từ DB (`useQuery`), đồng bộ store và lắp ráp các component con lại với nhau.

### ❓ Câu hỏi phỏng vấn thường gặp
*   **Q: Tại sao phải tách nhỏ component trong React? Tiêu chí nào để quyết định khi nào cần tách?**
    *   *Trả lời:* Tách component giúp code có tính tái sử dụng cao, dễ bảo trì, dễ viết kiểm thử độc lập và tối ưu hóa số lượng re-render của React. 
    *   Tiêu chí tách:
        1.  **Dựa trên kích thước:** File vượt quá 150 dòng hoặc phần JSX quá sâu.
        2.  **Dựa trên tính tái sử dụng:** Khối UI xuất hiện ở nhiều nơi (ví dụ: nút bấm, ô nhập liệu).
        3.  **Dựa trên trách nhiệm (SRP):** Khi một khối UI có logic nghiệp vụ hoặc state nội bộ hoàn toàn độc lập (ví dụ: Modal đóng mở, Form validation).
*   **Q: Khi tách component con như `TaskItem`, làm sao để gọi hành động điều hướng trang? Nên gọi trực tiếp hook `useNavigate` ở con hay truyền callback từ cha xuống?**
    *   *Trả lời:* 
        *   **Cách tốt nhất:** Nên khai báo `onNavigate` dạng callback ở `Props` của component con và truyền hàm từ component cha xuống. Việc này giúp component con trở thành "Pure Component" (hoặc Presentation Component) chỉ lo hiển thị, không phụ thuộc chặt chẽ (decouple) vào thư viện routing, giúp việc viết unit test cho component con cực kỳ dễ dàng bằng cách giả lập (mock) callback đó.
        *   Nếu gọi trực tiếp `useNavigate` trong con, con sẽ bị ràng buộc cứng với React Router, khó đem đi tái sử dụng hoặc test độc lập.



