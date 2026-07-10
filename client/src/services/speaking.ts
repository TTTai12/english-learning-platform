import { useAuthStore } from '../store/useAuthStore';
import { API_BASE_URL } from '../constants/api';

const API_URL = `${API_BASE_URL}/api/speaking`;

// Hàm lấy Token đăng nhập đính kèm vào Header
const getHeaders = () => {
    const token = useAuthStore.getState().token;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

// Khai báo kiểu dữ liệu trả về từ API chấm điểm nói
export interface SpeakingWord {
    word: string;
    status: 'correct' | 'incorrect' | 'missing';
}

export interface SpeakingAnalysisResponse {
    score: number;
    words: SpeakingWord[];
    grammarFeedback: string;
    suggestion: string;
}

/**
 * Gửi yêu cầu chấm điểm câu nói lên Backend
 * @param targetPhrase - Câu tiếng Anh mẫu
 * @param userSpeech - Câu chữ dịch từ giọng nói của người dùng
 */
export const analyzeSpeakingSpeech = async (targetPhrase: string, userSpeech: string): Promise<SpeakingAnalysisResponse> => {
    // TODO 1: Sử dụng hàm fetch để gửi một request POST lên API đường dẫn: `${API_URL}/analyze`
    const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ targetPhrase, userSpeech })
    });
    // TODO 2: Gửi kèm cấu hình headers lấy từ hàm getHeaders() ở trên
    // TODO 3: Gửi kèm body dạng JSON chứa { targetPhrase, userSpeech } (dùng JSON.stringify)\
    // TODO 4: Kiểm tra nếu response.ok = false thì quăng ra Error thông báo
    if (!response.ok) {
        throw new Error('Lỗi khi chấm điểm nói.');
    }
    // TODO 5: Trả về kết quả phân tích (response.json())
    return response.json();
};
