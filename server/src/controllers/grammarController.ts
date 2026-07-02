import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getGrammarTopics = async (req: Request, res: Response): Promise<void> => {
    try {
        // Dùng prisma.grammarTopic.findMany để lấy toàn bộ các chủ đề ngữ pháp
        const topics = await prisma.grammarTopic.findMany();

        // Trả về status 200 kèm json(topics)
        res.status(200).json(topics);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách ngữ pháp:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra trên server' });
    }
};
