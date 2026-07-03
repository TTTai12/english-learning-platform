import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js'; // Nhập prisma client

export const getRoadmapProgress = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id; // Lấy ID của user đang đăng nhập

        // TODO 1: Truy vấn tất cả bản ghi Progress của user này mà có isLearned = true, 
        // đồng thời nạp kèm (include) thông tin chi tiết của bảng Word tương ứng
        const learnedProgress = await prisma.progress.findMany({
            where: {
                userId,
                isLearned: true
            },
            include: {
                word: true
            }
        });

        // TODO 2: Truy vấn tất cả bản ghi Progress của user này mà có isBookmarked = true (đã lưu vào sổ tay)
        const bookmarkedProgress = await prisma.progress.findMany({
            where: {
                userId,
                isBookmarked: true
            }
        });

        // TODO 3: Phân loại đếm số lượng từ vựng đã học thuộc theo từng chủ đề (topic)
        // Hướng dẫn: Dùng hàm .filter() trên mảng learnedProgress đã lấy ở trên
        const dailyLearned = learnedProgress.filter(p => p.word.topic === 'daily').length;
        const businessLearned = learnedProgress.filter(p => p.word.topic === 'business').length;
        const travelLearned = learnedProgress.filter(p => p.word.topic === 'travel').length;
        const foodLearned = learnedProgress.filter(p => p.word.topic === 'food').length;
        const techLearned = learnedProgress.filter(p => p.word.topic === 'technology').length;

        // Mảng chứa danh sách ID các nhiệm vụ đã hoàn thành thực tế từ Database
        const completedTaskIds: string[] = [];

        // --- GIAI ĐOẠN 1: NỀN TẢNG ---
        // Nhiệm vụ 1.1: Học từ vựng hàng ngày (Hoàn thành khi học ít nhất 2 từ chủ đề daily)
        if (dailyLearned >= 2) completedTaskIds.push('t1-1');

        // Nhiệm vụ 1.2: Phát âm cơ bản (Hoàn thành khi học ít nhất 1 từ bất kỳ)
        if (learnedProgress.length >= 1) completedTaskIds.push('t1-2');

        // Nhiệm vụ 1.3: Mẫu câu chào hỏi (Hoàn thành khi học ít nhất 2 từ bất kỳ)
        if (learnedProgress.length >= 2) completedTaskIds.push('t1-3');

        // Nhiệm vụ 1.4: Nói 3 câu với AI (Hoàn thành khi có ít nhất 1 từ có reviewCount > 0)
        if (learnedProgress.some(p => p.reviewCount > 0)) completedTaskIds.push('t1-4');

        // Nhiệm vụ 1.5: Tạo bộ Flashcards (Hoàn thành khi có ít nhất 1 từ được lưu bookmark)
        if (bookmarkedProgress.length >= 1) completedTaskIds.push('t1-5');

        // --- GIAI ĐOẠN 2: XÂY DỰNG CÂU ---
        if (learnedProgress.length >= 4) completedTaskIds.push('t2-1');
        if (businessLearned >= 2) completedTaskIds.push('t2-2');
        if (bookmarkedProgress.length >= 2) completedTaskIds.push('t2-3');
        if (learnedProgress.some(p => p.reviewCount >= 2)) completedTaskIds.push('t2-4');
        if (bookmarkedProgress.length >= 3) completedTaskIds.push('t2-5');

        // --- GIAI ĐOẠN 3: HỘI THOẠI THỰC CHIẾN ---
        if (travelLearned >= 1 || foodLearned >= 1) completedTaskIds.push('t3-1');
        if (learnedProgress.length >= 6) completedTaskIds.push('t3-2');
        if (businessLearned >= 3) completedTaskIds.push('t3-3');
        if (learnedProgress.some(p => p.reviewCount >= 3)) completedTaskIds.push('t3-4');
        if (techLearned >= 1) completedTaskIds.push('t3-5');

        // --- GIAI ĐOẠN 4: LƯU LOÁT ---
        if (learnedProgress.length >= 8) completedTaskIds.push('t4-1');
        if (learnedProgress.length >= 10) completedTaskIds.push('t4-2');
        if (bookmarkedProgress.length >= 4) completedTaskIds.push('t4-3');
        if (learnedProgress.some(p => p.reviewCount >= 4)) completedTaskIds.push('t4-4');

        // Lấy thông tin user để xem streak ngày
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && user.streak >= 7) {
            completedTaskIds.push('t4-5'); // Hoàn thành thử thách streak
        }

        // Trả về kết quả JSON chứa mảng ID các nhiệm vụ đã làm được
        res.json({ completedTaskIds });
    } catch (error) {
        console.error('Lỗi khi tính toán tiến độ lộ trình:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy tiến độ lộ trình.' });
    }
};
