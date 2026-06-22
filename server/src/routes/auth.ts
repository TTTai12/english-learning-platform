import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js'; // Nhớ có đuôi .js
import { verifyToken } from '../middleware/auth.js'; // Nhớ có đuôi .js

const router = Router();

// TODO 1: Khai báo route POST '/register' kết nối với controller register
router.post('/register', register);
// TODO 2: Khai báo route POST '/login' kết nối với controller login
router.post('/login', login);
// TODO 3: Khai báo route GET '/me' đi qua middleware verifyToken trước, rồi đến controller getMe
router.get('/me', verifyToken as any, getMe);

export default router;
