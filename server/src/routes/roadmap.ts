import { Router } from 'express';
import { getRoadmapProgress } from '../controllers/roadmapController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Đường dẫn GET /api/roadmap (Cần đăng nhập)
router.get('/', verifyToken as any, getRoadmapProgress);

export default router;
