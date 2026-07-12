import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import vocabRoutes from './routes/vocab.js'; // Import router từ vựng
import { prisma } from './lib/prisma.js';
import grammarRoutes from './routes/grammar.js';
import speakingRouter from './routes/speaking.js';
import chatRouter from './routes/chat.js';
import roadmapRoutes from './routes/roadmap.js'

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
app.use('/api/grammar', grammarRoutes);
app.use('/api/chat', chatRouter);
app.use('/api/roadmap', roadmapRoutes);

// Endpoint Health Check — dùng cho cron-job.org để giữ Render server luôn sống
app.get('/health', (_req, res) => {
    res.status(200).send('ok');
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
// Thêm hàm này vào dưới hàm seedWords() và trên app.listen()
async function seedGrammar() {
    try {
        const count = await prisma.grammarTopic.count();
        if (count === 0) {
            console.log('🌱 Database trống. Đang nạp ngữ pháp mẫu...');

            const grammarData = [
                // 1. Thì hiện tại đơn
                {
                    title: "Thì hiện tại đơn",
                    description: "Diễn tả thói quen, sự thật hiển nhiên",
                    icon: "Timer",
                    color: "blue",
                    patterns: [
                        {
                            name: "Câu khẳng định",
                            formula: "S + V(s/es)",
                            examples: [
                                { english: "He plays soccer every Sunday.", vietnamese: "Anh ấy chơi bóng đá mỗi Chủ nhật." },
                                { english: "The sun rises in the East.", vietnamese: "Mặt trời mọc ở hướng Đông." }
                            ]
                        },
                        {
                            name: "Câu phủ định",
                            formula: "S + do/does + not + V",
                            examples: [
                                { english: "I do not like coffee.", vietnamese: "Tôi không thích cà phê." },
                                { english: "She doesn't speak French.", vietnamese: "Cô ấy không nói tiếng Pháp." }
                            ]
                        }
                    ]
                },
                // 2. Thì hiện tại tiếp diễn (đúng hình Figma)
                {
                    title: "Thì hiện tại tiếp diễn",
                    description: "Hành động đang diễn ra tại thời điểm nói",
                    icon: "RefreshCw",
                    color: "emerald",
                    patterns: [
                        {
                            name: "Câu khẳng định",
                            formula: "S + am/is/are + V-ing",
                            examples: [
                                { english: "I am learning English now.", vietnamese: "Tôi đang học tiếng Anh bây giờ." },
                                { english: "She is working on a new project.", vietnamese: "Cô ấy đang làm dự án mới." },
                                { english: "They are watching a movie.", vietnamese: "Họ đang xem phim." }
                            ]
                        },
                        {
                            name: "Câu phủ định",
                            formula: "S + am/is/are + not + V-ing",
                            examples: [
                                { english: "I'm not going to the party.", vietnamese: "Tôi không đi dự tiệc." },
                                { english: "He isn't sleeping.", vietnamese: "Anh ấy không ngủ." },
                                { english: "We aren't playing outside.", vietnamese: "Chúng tôi không chơi ngoài trời." }
                            ]
                        }
                    ]
                },
                // 3. Thì quá khứ đơn
                {
                    title: "Thì quá khứ đơn",
                    description: "Hành động đã xảy ra và kết thúc trong quá khứ",
                    icon: "History",
                    color: "purple",
                    patterns: [
                        {
                            name: "Câu khẳng định",
                            formula: "S + V2/ed",
                            examples: [
                                { english: "We visited Paris last year.", vietnamese: "Chúng tôi đã đến thăm Paris năm ngoái." },
                                { english: "He bought a new car yesterday.", vietnamese: "Hôm qua anh ấy đã mua một chiếc xe mới." }
                            ]
                        },
                        {
                            name: "Câu phủ định",
                            formula: "S + did + not + V",
                            examples: [
                                { english: "I did not see him at the party.", vietnamese: "Tôi đã không nhìn thấy anh ấy tại bữa tiệc." },
                                { english: "They didn't finish their homework.", vietnamese: "Họ đã không hoàn thành bài tập về nhà." }
                            ]
                        }
                    ]
                },
                // 4. Thì hiện tại hoàn thành
                {
                    title: "Thì hiện tại hoàn thành",
                    description: "Hành động đã hoàn thành, có liên quan đến hiện tại",
                    icon: "CheckCircle2",
                    color: "amber",
                    patterns: [
                        {
                            name: "Câu khẳng định",
                            formula: "S + have/has + V3/ed",
                            examples: [
                                { english: "I have lived here for five years.", vietnamese: "Tôi đã sống ở đây được 5 năm." },
                                { english: "She has already finished her work.", vietnamese: "Cô ấy đã hoàn thành công việc của mình rồi." }
                            ]
                        },
                        {
                            name: "Câu phủ định",
                            formula: "S + have/has + not + V3/ed",
                            examples: [
                                { english: "They have not seen that movie yet.", vietnamese: "Họ vẫn chưa xem bộ phim đó." },
                                { english: "He hasn't called me today.", vietnamese: "Hôm qua anh ấy vẫn chưa gọi cho tôi." }
                            ]
                        }
                    ]
                },
                // 5. Thì tương lai đơn
                {
                    title: "Thì tương lai đơn",
                    description: "Dự định, kế hoạch trong tương lai",
                    icon: "TrendingUp",
                    color: "rose",
                    patterns: [
                        {
                            name: "Câu khẳng định",
                            formula: "S + will + V",
                            examples: [
                                { english: "I will help you with your homework.", vietnamese: "Tôi sẽ giúp bạn làm bài tập về nhà." },
                                { english: "We will travel to Japan next month.", vietnamese: "Chúng tôi sẽ đi du lịch Nhật Bản vào tháng tới." }
                            ]
                        },
                        {
                            name: "Câu phủ định",
                            formula: "S + will + not + V",
                            examples: [
                                { english: "They will not join the meeting.", vietnamese: "Họ sẽ không tham gia cuộc họp." },
                                { english: "She won't come to the party.", vietnamese: "Cô ấy sẽ không đến bữa tiệc." }
                            ]
                        }
                    ]
                }

            ];

            for (const topic of grammarData) {
                await prisma.grammarTopic.create({ data: topic });
            }
            console.log('✅ Nạp ngữ pháp mẫu thành công!');
        }
    } catch (error) {
        console.error('❌ Lỗi khi nạp dữ liệu ngữ pháp mẫu:', error);
    }
}


// Khởi chạy app lắng nghe (listen) trên biến port đã khai báo ở trên
app.listen(port, async () => {
    await seedWords();
    await seedGrammar();
    console.log(`🚀 Server is running on port ${port}`);
});
app.use('/api/speaking', speakingRouter);
