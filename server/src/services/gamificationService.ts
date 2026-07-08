import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

export const updateGamification = async (
  userId: string,
  xpAmount: number,
  txClient?: Prisma.TransactionClient
) => {
  // Nếu có txClient (khi chạy lồng transaction) thì dùng txClient, ngược lại dùng prisma gốc
  const execute = async (tx: Prisma.TransactionClient) => {
    // TODO 1: Tìm User trong DB dựa vào userId bằng tx.user.findUnique
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // TODO 2: Lấy thông tin user.streak và user.lastActive hiện tại
    const { streak, lastActive } = user;

    // TODO 3: Viết logic so sánh ngày như thuật toán ở trên để tính newStreak
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let newStreak = streak;

    if (!lastActive) {
      newStreak = 1;
    } else {
      const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      const diffTime = today.getTime() - lastActiveDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = streak + 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }
    // TODO 4: Gọi tx.user.update để cập nhật:
    // - xp tăng thêm xpAmount (sử dụng { increment: xpAmount })
    // - streak nhận giá trị newStreak mới tính
    // - lastActive nhận giá trị ngày giờ hiện tại (new Date())
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpAmount },
        streak: newStreak,
        lastActive: now,
      },
      select: {
        id: true,
        email: true,
        xp: true,
        streak: true,
      },
    });
    // TODO 5: Trả về user sau khi cập nhật
    return updatedUser;
  };

  // NẾU CÓ txClient truyền vào -> Chạy trực tiếp dùng chung transaction cha
  if (txClient) {
    return await execute(txClient);
  }

  // NẾU KHÔNG CÓ -> Tự tạo transaction mới
  return await prisma.$transaction(async (tx) => {
    return await execute(tx);
  });
};
