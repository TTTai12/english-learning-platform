import { useAuthStore } from '../store/useAuthStore';

const API_URL = 'http://localhost:5000/api/vocabulary';

// Helper lấy headers chứa JWT token tự động từ Zustand Auth Store
const getHeaders = () => {
    const token = useAuthStore.getState().token;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

// 1. Lấy danh sách từ vựng theo chủ đề (topic)
export const fetchWordsByTopic = async (topic: string) => {
    const response = await fetch(`${API_URL}?topic=${topic}`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Không thể tải danh sách từ vựng');
    }
    return response.json();
};

// 2. Lưu/Xóa từ vựng khỏi sổ tay (Bookmark)
export const toggleWordBookmark = async (wordId: string) => {
    const response = await fetch(`${API_URL}/bookmark/${wordId}`, {
        method: 'POST',
        headers: getHeaders(),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Lỗi khi cập nhật sổ tay');
    }
    return response.json();
};

// 3. Đánh dấu đã học / chưa học
export const toggleWordLearned = async (wordId: string) => {
    const response = await fetch(`${API_URL}/learned/${wordId}`, {
        method: 'POST',
        headers: getHeaders(),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Lỗi khi cập nhật tiến trình học');
    }
    return response.json();
};

// 4. Lấy danh sách toàn bộ từ đã lưu trong sổ tay
export const fetchBookmarkedWords = async () => {
    const response = await fetch(`${API_URL}/bookmarks`, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Không thể tải sổ tay từ vựng');
    }
    return response.json();
};
