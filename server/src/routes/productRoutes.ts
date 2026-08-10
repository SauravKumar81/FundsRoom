import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  adjustStock, 
  getAllStockLogs 
} from '../controllers/productController';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRoles(['Admin', 'Sales', 'Warehouse', 'Accounts']), getProducts);
router.get('/logs/all', requireRoles(['Admin', 'Sales', 'Warehouse', 'Accounts']), getAllStockLogs);
router.get('/:id', requireRoles(['Admin', 'Sales', 'Warehouse', 'Accounts']), getProductById);
router.post('/', requireRoles(['Admin', 'Warehouse', 'Sales']), createProduct);
router.put('/:id', requireRoles(['Admin', 'Warehouse', 'Sales']), updateProduct);
router.post('/:id/stock', requireRoles(['Admin', 'Warehouse']), adjustStock);

export default router;
