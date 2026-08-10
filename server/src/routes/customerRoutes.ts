import { Router } from 'express';
import { 
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  addFollowUpNote 
} from '../controllers/customerController';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRoles(['Admin', 'Sales', 'Warehouse', 'Accounts']), getCustomers);
router.get('/:id', requireRoles(['Admin', 'Sales', 'Warehouse', 'Accounts']), getCustomerById);
router.post('/', requireRoles(['Admin', 'Sales']), createCustomer);
router.put('/:id', requireRoles(['Admin', 'Sales']), updateCustomer);
router.post('/:id/notes', requireRoles(['Admin', 'Sales']), addFollowUpNote);

export default router;
