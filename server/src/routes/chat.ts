import { Router } from 'express';
import { streamChat } from '../controllers/chatController.js';
import { verifyToken } from '../middleware/auth.js';

// TODO 1: Khởi tạo đối tượng Router của Express
const router = Router();

// TODO 2: Đăng ký router đường dẫn POST '/stream' đi qua middleware 'verifyToken' và gọi hàm 'streamChat'
router.post('/stream', verifyToken as any, streamChat);

export default router;
