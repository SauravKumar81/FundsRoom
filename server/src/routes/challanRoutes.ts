import { Router } from 'express';
import { 
  getChallans, 
  getChallanById, 
  createChallan, 
  updateChallanStatus 
} from '../controllers/challanController';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRoles(['Admin', 'Sales', 'Warehouse', 'Accounts']), getChallans);
router.get('/:id', requireRoles(['Admin', 'Sales', 'Warehouse', 'Accounts']), getChallanById);
router.post('/', requireRoles(['Admin', 'Sales']), createChallan);
router.patch('/:id/status', requireRoles(['Admin', 'Sales', 'Warehouse']), updateChallanStatus);

export default router;
