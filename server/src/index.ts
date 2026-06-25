import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; 
import vocabRoutes from './routes/vocab.js'; // Import router từ vựng
import { prisma } from './lib/prisma.js';

// Cấu hình dotenv để đọc file .env
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Cấu hình middleware cors()
app.use(cors());

// Cấu hình middleware express.json() để parse JSON body
app.use(express.json());

// Kết nối các route
app.use('/api/auth', authRoutes);
app.use('/api/vocabulary', vocabRoutes); // Đăng ký route từ vựng dưới tiền tố /api/vocabulary

// Endpoint test sức khỏe server (Health Check)
app.get('/test', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Hàm tự động nạp (seed) dữ liệu từ vựng mẫu nếu database đang trống
async function seedWords() {
    try {
        const count = await prisma.word.count();
        if (count === 0) {
            console.log('🌱 Database trống. Đang nạp từ vựng mẫu...');
            const wordsData = [
                { english: 'Collaborate', vietnamese: 'Cộng tác, hợp tác', phonetic: '/kəˈlæbəreɪt/', example: 'We collaborate with international teams on this project.', topic: 'daily', difficulty: 'medium' },
                { english: 'Achievement', vietnamese: 'Thành tích, thành tựu', phonetic: '/əˈtʃiːvmənt/', example: 'This is a great achievement for our team.', topic: 'daily', difficulty: 'easy' },
                { english: 'Enthusiastic', vietnamese: 'Nhiệt tình, hăng hái', phonetic: '/ɪnˌθuːziˈæstɪk/', example: 'She is very enthusiastic about learning new skills.', topic: 'daily', difficulty: 'hard' },
                { english: 'Negotiation', vietnamese: 'Đàm phán, thương lượng', phonetic: '/nɪˌɡoʊʃiˈeɪʃn/', example: 'The negotiation lasted three hours but ended successfully.', topic: 'business', difficulty: 'hard' },
                { english: 'Stakeholder', vietnamese: 'Bên liên quan, cổ đông', phonetic: '/ˈsteɪkhoʊldər/', example: 'We need to present the plan to all stakeholders.', topic: 'business', difficulty: 'medium' },
                { english: 'Itinerary', vietnamese: 'Lịch trình chuyến đi', phonetic: '/aɪˈtɪnəreri/', example: 'Please check your itinerary for hotel check-in times.', topic: 'travel', difficulty: 'hard' },
                { english: 'Ingredient', vietnamese: 'Nguyên liệu, thành phần', phonetic: '/ɪnˈɡriːdiənt/', example: 'The secret ingredient makes this dish special.', topic: 'food', difficulty: 'medium' },
                { english: 'Symptom', vietnamese: 'Triệu chứng', phonetic: '/ˈsɪmptəm/', example: 'What symptoms have you been experiencing?', topic: 'health', difficulty: 'medium' },
                { english: 'Algorithm', vietnamese: 'Thuật toán', phonetic: '/ˈælɡərɪðəm/', example: 'The algorithm processes millions of data points.', topic: 'technology', difficulty: 'medium' },
            ];

            for (const word of wordsData) {
                await prisma.word.create({ data: word });
            }
            console.log('✅ Nạp từ vựng mẫu thành công!');
        }
    } catch (error) {
        console.error('❌ Lỗi khi nạp dữ liệu mẫu:', error);
    }
}

// Khởi chạy app lắng nghe (listen) trên biến port đã khai báo ở trên
app.listen(port, async () => {
    await seedWords();
    console.log(`🚀 Server is running on port ${port}`);
});
