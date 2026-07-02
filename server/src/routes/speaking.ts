import { Router } from 'express';
import { analyzeSpeaking } from '../controllers/speakingController.js';
import { verifyToken } from '../middleware/auth.js';
// TODO: 1. Khai báo bộ định tuyến Router của Express
const router = Router();

// TODO: 2. Đăng ký endpoint POST /api/speaking/analyze
// - Sử dụng middleware 'verifyToken' ở giữa để ép người dùng phải đăng nhập mới được gọi API này
router.post('/analyze', verifyToken as any, analyzeSpeaking);



export default router;
