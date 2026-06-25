import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// 1. Lấy danh sách từ vựng theo chủ đề (topic) kèm trạng thái học/bookmark của user hiện tại
export const getWordsByTopic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { topic } = req.query;
        const userId = (req as any).userId; // Được điền bởi middleware verifyToken (nếu có)

        if (!topic) {
            res.status(400).json({ message: 'Thiếu chủ đề (topic)' });
            return;
        }

        // TODO 1: Dùng prisma.word.findMany để lấy tất cả từ có topic trùng khớp
        const words = await prisma.word.findMany({
            where: { topic: topic as string }
        })
        // TODO 2: Nếu có userId (đã đăng nhập), lấy tiến trình học (Progress) của user này cho những từ trên
        const progressList = await prisma.progress.findMany({
            where: {
                userId,
                wordId: { in: words.map((w) => w.id) }
            }
        });

        // TODO 3: Ghép dữ liệu từ vựng với tiến trình học (isLearned, isBookmarked)
        // Nếu chưa đăng nhập hoặc chưa học từ này, mặc định là false
        const wordsWithProgress = words.map((word) => {
            const userProgress = progressList.find((p) => p.wordId === word.id);
            return {
                ...word,
                isLearned: userProgress?.isLearned || false,
                isBookmarked: userProgress?.isBookmarked || false
            };
        });
        // TODO 4: Trả về res.status(200).json(wordsWithProgress)
        res.status(200).json(wordsWithProgress);
    } catch (error) {
        console.error('Lỗi khi lấy từ vựng:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra trên server' });
    }
};

// 2. Lưu/Xóa từ vựng khỏi sổ tay (toggle bookmark)
export const toggleBookmark = async (req: Request, res: Response): Promise<void> => {
    try {
        const { wordId } = req.params;
        const userId = (req as any).userId;

        // Thêm Type Guard kiểm tra kiểu dữ liệu của wordId
        if (typeof wordId !== 'string') {
            res.status(400).json({ message: 'Mã từ vựng không hợp lệ' });
            return;
        }

        // TODO 1: Kiểm tra xem từ vựng (wordId) có tồn tại không
        const word = await prisma.word.findUnique({ where: { id: wordId } });
        if (!word) {
            res.status(404).json({ message: 'Không tìm thấy từ vựng' });
            return;
        }
        // TODO 2: Tìm tiến trình (Progress) hiện tại của user cho từ này
        const progress = await prisma.progress.findUnique({
            where: {
                userId_wordId: { userId, wordId }
            }
        });
        // TODO 3: Nếu chưa có Progress -> Tạo mới với isBookmarked = true
        // Nếu đã có -> Cập nhật nghịch đảo giá trị (isBookmarked = !progress.isBookmarked)
        const updatedProgress = await prisma.progress.upsert({
            where: { userId_wordId: { userId, wordId } },
            create: { userId, wordId, isBookmarked: true },
            update: { isBookmarked: !progress?.isBookmarked }
        });
        // TODO 4: Trả về kết quả res.json(...)
        res.status(200).json({
            message: `Đã ${updatedProgress.isBookmarked ? 'thêm' : 'xóa'} khỏi sổ tay`,
            isBookmarked: updatedProgress.isBookmarked
        });
    } catch (error) {
        console.error('Lỗi khi toggle bookmark:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra trên server' });
    }
};

// 3. Đánh dấu đã học / chưa học (toggle learned)
export const toggleLearned = async (req: Request, res: Response): Promise<void> => {
    try {
        const { wordId } = req.params;
        const userId = (req as any).userId;

        if (typeof wordId !== 'string') {
            res.status(400).json({ message: 'Mã từ vựng không hợp lệ' });
            return;
        }

        // TODO 1: Kiểm tra từ vựng có tồn tại không
        const word = await prisma.word.findUnique({ where: { id: wordId } });
        if (!word) {
            res.status(404).json({ message: 'Không tìm thấy từ vựng' });
            return;
        }

        // TODO 2: Tìm Progress hiện tại của user cho từ này
        const progress = await prisma.progress.findUnique({
            where: { userId_wordId: { userId, wordId } }
        });

        // TODO 3: Nếu chưa có Progress -> Tạo mới với isLearned = true. Cộng 10 XP cho User.
        // Nếu đã có -> Cập nhật nghịch đảo (isLearned = !progress.isLearned). 
        // Nếu chuyển sang trạng thái đã học (true) -> Cộng 10 XP cho User.
        const updatedProgress = await prisma.progress.upsert({
            where: { userId_wordId: { userId, wordId } },
            create: { userId, wordId, isLearned: true },
            update: { isLearned: !progress?.isLearned }
        });

        let xpEarned = 0;
        if (updatedProgress.isLearned) {
            xpEarned = 10;
            await prisma.user.update({
                where: { id: userId },
                data: { xp: { increment: 10 } }
            });
        }

        // TODO 4: Trả về kết quả res.json(...)
        res.status(200).json({
            message: updatedProgress.isLearned ? 'Đã đánh dấu đã học (+10 XP)' : 'Đã bỏ đánh dấu đã học',
            isLearned: updatedProgress.isLearned,
            xpEarned
        });

    } catch (error) {
        console.error('Lỗi khi toggle learned:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra trên server' });
    }
};

// 4. Lấy danh sách từ vựng đã lưu trong sổ tay (bookmarks) của user hiện tại
export const getBookmarkedWords = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;

        // TODO 1: Dùng prisma.progress.findMany để lấy tất cả progress của user có isBookmarked = true
        // Nhớ dùng 'include: { word: true }' để lấy kèm thông tin chi tiết của từ vựng đó
        const progressList = await prisma.progress.findMany({
            where: {
                userId,
                isBookmarked: true
            },
            include: {
                word: true
            }
        });

        // TODO 2: Map kết quả trả về mảng danh sách từ vựng kèm chi tiết và thông tin progress
        const words = progressList.map((p) => {
            return {
                id: p.word.id,
                english: p.word.english,
                vietnamese: p.word.vietnamese,
                phonetic: p.word.phonetic,
                example: p.word.example,
                topic: p.word.topic,
                difficulty: p.word.difficulty,
                isLearned: p.isLearned,
                isBookmarked: p.isBookmarked,
                reviewCount: p.reviewCount,
                nextReview: p.nextReview,
                savedAt: p.createdAt // Để map với trường savedAt hiển thị ở FE
            };
        });

        // TODO 3: Trả về res.status(200).json(words)
        res.status(200).json(words);

    } catch (error) {
        console.error('Lỗi khi lấy sổ tay từ vựng:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra trên server' });
    }
};
