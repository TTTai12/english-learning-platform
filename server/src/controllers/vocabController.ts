import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { extractWordsFromText } from '../services/geminiService.js';
import { updateGamification } from '../services/gamificationService.js';

// 1. Lấy danh sách từ vựng theo chủ đề (topic) hoặc độ khó (difficulty) kèm trạng thái
export const getWordsByTopic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { topic, difficulty } = req.query; // Đọc cả topic và difficulty từ query params
        const userId = (req as any).userId;

        // Xây dựng điều kiện lọc động
        const whereClause: any = {};
        if (topic) whereClause.topic = topic as string;
        if (difficulty) whereClause.difficulty = difficulty as string;

        // Dùng prisma.word.findMany để lấy tất cả từ khớp điều kiện lọc
        const words = await prisma.word.findMany({
            where: whereClause
        });

        // Lấy tiến trình học (Progress) của user này cho những từ trên
        const progressList = await prisma.progress.findMany({
            where: {
                userId,
                wordId: { in: words.map((w) => w.id) }
            }
        });

        // Ghép dữ liệu từ vựng với tiến trình học (isLearned, isBookmarked)
        const wordsWithProgress = words.map((word) => {
            const userProgress = progressList.find((p) => p.wordId === word.id);
            return {
                ...word,
                isLearned: userProgress?.isLearned || false,
                isBookmarked: userProgress?.isBookmarked || false
            };
        });

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
        let xpEarned = 0;
        let userStats = null;

        const updatedProgress = await prisma.$transaction(async (tx) => {
            const up = await tx.progress.upsert({
                where: { userId_wordId: { userId, wordId } },
                create: { userId, wordId, isLearned: true },
                update: { isLearned: !progress?.isLearned }
            });

            if (up.isLearned) {
                xpEarned = 10;
                userStats = await updateGamification(userId, 10, tx);
            }

            return up;
        });

        // TODO 4: Trả về kết quả res.json(...)
        res.status(200).json({
            message: updatedProgress.isLearned ? 'Đã đánh dấu đã học (+10 XP)' : 'Đã bỏ đánh dấu đã học',
            isLearned: updatedProgress.isLearned,
            xpEarned,
            user: userStats
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
// Cách đúng:
export const reviewWord = async (req: Request, res: Response): Promise<void> => {
    try {
        const { wordId } = req.params;
        const { isCorrect } = req.body;  // ← true hoặc false
        const userId = (req as any).userId;

        if (typeof wordId !== 'string' || typeof isCorrect !== 'boolean') {
            res.status(400).json({ message: 'Dữ liệu đầu vào không hợp lệ' });
            return;
        }

        // 1. Lấy Progress hiện tại của user cho từ này
        const progress = await prisma.progress.findUnique({
            where: { userId_wordId: { userId, wordId } }
        });

        // 2. Tính reviewCount mới và nextReview
        let newReviewCount: number;
        let newNextReview: Date;

        if (isCorrect) {
            newReviewCount = (progress?.reviewCount || 0) + 1;
            // Tính số ngày: [1, 3, 7, 14, 30] tùy reviewCount
            const intervals = [1, 3, 7, 14, 30];
            const days = intervals[Math.min(newReviewCount - 1, intervals.length - 1)];
            newNextReview = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        } else {
            newReviewCount = 0;          // Reset về 0
            newNextReview = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // Ngày mai
        }

        // 3. Upsert Progress với reviewCount và nextReview mới
        const updated = await prisma.progress.upsert({
            where: { userId_wordId: { userId, wordId } },
            update: {
                reviewCount: newReviewCount,
                nextReview: newNextReview
            },
            create: {
                userId,
                wordId,
                reviewCount: newReviewCount,
                nextReview: newNextReview,
                isLearned: true  // Lần đầu review đúng → đánh dấu đã học
            }
        })

        // 4. Trả về response
        res.status(200).json({
            message: "Cập nhật tiến độ học thành công",
            reviewCount: updated.reviewCount,
            nextReview: updated.nextReview
        })
    } catch (error) {
        console.error('Lỗi khi review từ vựng:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra trên server' });
    }
};

// 6. API Gọi Gemini trích xuất từ vựng từ đoạn văn bản
export const generateFlashcards = async (req: Request, res: Response): Promise<void> => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            res.status(400).json({ message: 'Văn bản gửi lên không hợp lệ' });
            return;
        }

        // 1. Gọi AI trích xuất từ vựng (chứa english, vietnamese, topic, difficulty...)
        const aiWords = await extractWordsFromText(text);

        // 2. Duyệt qua danh sách từ AI trả về, kiểm tra và lưu vào Database nếu chưa tồn tại
        const savedWords = [];
        for (const word of aiWords) {
            // Tìm xem từ vựng này đã tồn tại trong DB chưa (không phân biệt hoa thường)
            let dbWord = await prisma.word.findFirst({
                where: {
                    english: {
                        equals: word.english,
                        mode: 'insensitive' // Không phân biệt hoa thường
                    }
                }
            });

            // Nếu chưa có, tự động tạo mới trong Database
            if (!dbWord) {
                dbWord = await prisma.word.create({
                    data: {
                        english: word.english,
                        vietnamese: word.vietnamese,
                        phonetic: word.phonetic,
                        example: word.example,
                        topic: word.topic,
                        difficulty: word.difficulty
                    }
                });
            }
            savedWords.push(dbWord);
        }

        // 3. Trả về mảng từ vựng ĐÃ CÓ ID THẬT từ Database cho Client
        res.status(200).json(savedWords);
    } catch (error) {
        console.error('Lỗi khi gọi Gemini API:', error);
        res.status(500).json({ message: 'Lỗi server khi kết nối AI để tạo từ vựng' });
    }
};

