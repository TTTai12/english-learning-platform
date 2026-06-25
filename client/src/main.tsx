import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
// TODO 1: Import QueryClient và QueryClientProvider từ '@tanstack/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// TODO 2: Khởi tạo instance queryClient với cấu hình mặc định (defaultOptions)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Không tự động tải lại khi click ngoài rồi quay lại tab
      retry: 1, // Nếu API lỗi thì thử gọi lại tối đa 1 lần
    }
  }
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* TODO 3: Bọc toàn bộ ứng dụng bằng <QueryClientProvider client={...}> */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
