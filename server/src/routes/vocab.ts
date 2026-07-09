import { Router } from 'express';
import { getWordsByTopic, toggleBookmark, toggleLearned, getBookmarkedWords, reviewWord, generateFlashcards, getWeeklyActivity } from '../controllers/vocabController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Tất cả các router từ vựng đều yêu cầu người dùng đăng nhập (đi qua verifyToken)
router.get('/', verifyToken as any, getWordsByTopic);
router.get('/weekly-activity', verifyToken as any, getWeeklyActivity);
router.post('/bookmark/:wordId', verifyToken as any, toggleBookmark);
router.post('/learned/:wordId', verifyToken as any, toggleLearned);
router.get('/bookmarks', verifyToken as any, getBookmarkedWords);
router.post('/review/:wordId', verifyToken as any, reviewWord);
router.post('/generate-flashcards', verifyToken as any, generateFlashcards);

export default router;
