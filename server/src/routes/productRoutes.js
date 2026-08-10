"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', (0, auth_1.requireRoles)(['Admin', 'Sales', 'Warehouse', 'Accounts']), productController_1.getProducts);
router.get('/logs/all', (0, auth_1.requireRoles)(['Admin', 'Sales', 'Warehouse', 'Accounts']), productController_1.getAllStockLogs);
router.get('/:id', (0, auth_1.requireRoles)(['Admin', 'Sales', 'Warehouse', 'Accounts']), productController_1.getProductById);
router.post('/', (0, auth_1.requireRoles)(['Admin', 'Warehouse', 'Sales']), productController_1.createProduct);
router.put('/:id', (0, auth_1.requireRoles)(['Admin', 'Warehouse', 'Sales']), productController_1.updateProduct);
router.post('/:id/stock', (0, auth_1.requireRoles)(['Admin', 'Warehouse']), productController_1.adjustStock);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map