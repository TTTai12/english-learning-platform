export const defaultMockExercises: Record<string, Array<{ id: string; english: string; vietnamese: string; example: string }>> = {
  easy: [
    { id: 'mock-e1', english: 'Hello', vietnamese: 'Xin chào, rất vui được gặp bạn.', example: 'Hello, nice to meet you.' },
    { id: 'mock-e2', english: 'Today', vietnamese: 'Bạn khỏe không?', example: 'How are you doing today.' }
  ],
  medium: [
    { id: 'mock-m1', english: 'Order', vietnamese: 'Tôi muốn đặt một tách latte nóng, vui lòng.', example: 'I would like to order a cup of hot latte please.' },
    { id: 'mock-m2', english: 'Excuse me', vietnamese: 'Xin lỗi, cửa hàng tiện lợi gần nhất ở đâu?', example: 'Excuse me where is the nearest convenience store.' }
  ],
  hard: [
    { id: 'mock-h1', english: 'Experience', vietnamese: 'Tôi có hai năm kinh nghiệm trong lĩnh vực phát triển web.', example: 'I have two years of experience in web development.' },
    { id: 'mock-h2', english: 'Collaborate', vietnamese: 'Chúng ta cần hợp tác trong dự án này để kịp tiến độ.', example: 'We need to collaborate on this project to meet the deadline.' }
  ]
};
