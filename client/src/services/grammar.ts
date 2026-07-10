import { useAuthStore } from '../store/useAuthStore';
import { API_BASE_URL } from '../constants/api';

const API_URL = `${API_BASE_URL}/api/grammar`;

// Helper lấy headers chứa JWT token tự động
const getHeaders = () => {
    const token = useAuthStore.getState().token;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

// Lấy danh sách toàn bộ chủ đề ngữ pháp
export const fetchGrammarTopics = async () => {
    // TODO: Gửi request GET tới API_URL với headers lấy từ getHeaders()
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: getHeaders(),
    });

    // TODO: Nếu !response.ok -> quăng lỗi (throw new Error) kèm thông báo từ server hoặc mặc định
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Không thể tải danh sách ngữ pháp');
    }

    // TODO: Trả về kết quả JSON
    return response.json();
};
