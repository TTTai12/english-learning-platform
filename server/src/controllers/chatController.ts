import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getChatStream } from '../services/geminiService.js';
import { updateGamification } from '../services/gamificationService.js';

// Khởi tạo Gemini SDK bằng API Key từ file .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const streamChat = async (req: Request, res: Response): Promise<void> => {
    try {
        // TODO: Bóc tách thêm systemInstruction từ req.body
        const { message, history, systemInstruction } = req.body;
        const userId = (req as any).userId;

        if (!message) {
            res.status(400).json({ message: 'Tin nhắn không được để trống.' });
            return;
        }

        // Cộng +8 XP cho user khi gửi tin nhắn trò chuyện
        if (userId) {
            await updateGamification(userId, 8);
        }

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // TODO: Truyền thêm systemInstruction vào đối số thứ 3 của hàm getChatStream
        const streamResult = await getChatStream(message, history || [], systemInstruction);

        for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            res.write(chunkText);
        }

        res.end();
    } catch (error) {
        console.error('Lỗi khi stream chat:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Lỗi server khi xử lý cuộc hội thoại.' });
        } else {
            res.end();
        }
    }
};
