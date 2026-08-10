import { Router } from 'express';
import { login, getMe, getUsers } from '../controllers/authController';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.get('/users', authenticateToken, requireRoles(['Admin']), getUsers);

export default router;
