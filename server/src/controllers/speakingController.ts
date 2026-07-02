import { Request, Response } from 'express';
import { analyzeSpeech } from '../services/geminiService.js';

// TODO: 1. Nhận request từ Express và chuẩn bị xử lý bất đồng bộ (async)
export const analyzeSpeaking = async (req: Request, res: Response): Promise<void> => {
    try {
        // TODO: 2. Bóc tách dữ liệu gửi từ Body của request (gồm câu mẫu và câu người dùng nói)
        const { targetPhrase, userSpeech } = req.body;

        // TODO: 3. Kiểm tra dữ liệu đầu vào (Validation) - Nếu thiếu thì trả về lỗi 400 Bad Request
        if (!targetPhrase || !userSpeech) {
            res.status(400).json({ message: 'Thiếu câu mẫu hoặc câu đọc của người dùng.' });
            return;
        }

        // TODO: 4. Gọi hàm analyzeSpeech (đang chạy qua internet nên cần 'await') để Gemini so sánh và chấm điểm
        const analysis = await analyzeSpeech(targetPhrase, userSpeech);

        // TODO: 5. Gửi trả kết quả phân tích (điểm số, từ đúng/sai) về cho Frontend dạng JSON sạch
        res.status(200).json(analysis);
    } catch (error) {
        // TODO: 6. Khối catch bắt các lỗi mạng/AI sập để server không bị crash và trả về lỗi 500
        console.error('Lỗi khi chấm điểm nói:', error);
        res.status(500).json({ message: 'Lỗi server khi phân tích giọng nói.' });
    }
};
