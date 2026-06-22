import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; // 1. Import router xác thực từ file auth.ts

// Cấu hình dotenv để đọc file .env
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Cấu hình middleware cors()
app.use(cors());

// Cấu hình middleware express.json() để parse JSON body
app.use(express.json());

// 2. Kết nối các route xác thực dưới tiền tố /api/auth
app.use('/api/auth', authRoutes);

// Endpoint test sức khỏe server (Health Check)
app.get('/test', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Khởi chạy app lắng nghe (listen) trên biến port đã khai báo ở trên
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`)
})
