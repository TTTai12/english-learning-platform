import { Router } from 'express';
import { getGrammarTopics } from '../controllers/grammarController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Lấy danh sách toàn bộ chủ đề ngữ pháp (yêu cầu đăng nhập)
router.get('/', verifyToken as any, getGrammarTopics);

export default router;
