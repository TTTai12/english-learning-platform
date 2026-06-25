import { Router } from 'express';
import { getWordsByTopic, toggleBookmark, toggleLearned, getBookmarkedWords } from '../controllers/vocabController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Tất cả các router từ vựng đều yêu cầu người dùng đăng nhập (đi qua verifyToken)
router.get('/', verifyToken as any, getWordsByTopic);
router.post('/bookmark/:wordId', verifyToken as any, toggleBookmark);
router.post('/learned/:wordId', verifyToken as any, toggleLearned);
router.get('/bookmarks', verifyToken as any, getBookmarkedWords);

export default router;
