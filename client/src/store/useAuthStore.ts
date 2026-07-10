import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE_URL } from '../constants/api';

export interface User {
  id: string;
  email: string;
  streak: number;
  xp: number;
}
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getMe: () => Promise<void>;
  clearError: () => void;
}

const API_URL = `${API_BASE_URL}/api/auth`;
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // TODO 1: Gửi request POST đến `${API_URL}/login` với body là { email, password }
          // Sử dụng hàm fetch() mặc định của trình duyệt
          // Đừng quên Header 'Content-Type': 'application/json'
          // Lấy kết quả data = await response.json();
          // Nếu !response.ok -> quăng lỗi (throw new Error(data.message || 'Đăng nhập thất bại'))
          const response = await fetch(`${API_URL}/login`, {
            method: 'POST', // Phương thức gửi dữ liệu là POST
            headers: {
              'Content-Type': 'application/json', // Báo cho server biết body gửi lên là định dạng JSON
            },
            body: JSON.stringify({ email, password }), // Chuyển object JavaScript thành chuỗi JSON
          });
          // Chờ và phân tích cú pháp dữ liệu JSON phản hồi từ server
          const data = await response.json();
          // Nếu mã trạng thái HTTP trả về không nằm trong khoảng thành công (200-299)
          if (!response.ok) {
            // Quăng lỗi ra ngoài kèm thông báo lỗi từ server (hoặc thông báo mặc định)
            throw new Error(data.message || 'Đăng nhập thất bại');
          }
          // TODO 2: Nếu thành công, cập nhật state: user: data.user, token: data.token, isAuthenticated: true, isLoading: false
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true; // Trả về true nếu thành công
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false; // Thất bại
        }
      },
      register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // TODO 3: Gửi request POST đến `${API_URL}/register` với body là { email, password }
          const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          // TODO 4: Xử lý phản hồi tương tự như Login
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || 'Đăng ký thất bại');
          }
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      logout: () => {
        // TODO 5: Reset các state: user, token, isAuthenticated về mặc định (null / false)
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },
      getMe: async () => {
        const { token } = get();
        if (!token) return;
        set({ isLoading: true });
        try {
          // TODO 6: Gửi request GET đến `${API_URL}/me` với Header: Authorization: `Bearer ${token}`
          const response = await fetch(`${API_URL}/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            },
          });
          // TODO 7: Nếu thành công, set { user: data.user, isLoading: false }
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || 'Không lấy được thông tin');
          }
          set({
            user: data.user,
            isLoading: false,
          });
        } catch (error: any) {
          // Nếu gặp lỗi (ví dụ token hết hạn), thực hiện logout tự động
          set({ error: error.message, isLoading: false });
          get().logout();
        }
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'english-ai-auth-storage', // Tên key trong localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }), // Chỉ lưu lại 3 thông tin này ở localStorage
    }
  )
);
