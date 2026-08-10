"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challanController_1 = require("../controllers/challanController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', (0, auth_1.requireRoles)(['Admin', 'Sales', 'Warehouse', 'Accounts']), challanController_1.getChallans);
router.get('/:id', (0, auth_1.requireRoles)(['Admin', 'Sales', 'Warehouse', 'Accounts']), challanController_1.getChallanById);
router.post('/', (0, auth_1.requireRoles)(['Admin', 'Sales']), challanController_1.createChallan);
router.patch('/:id/status', (0, auth_1.requireRoles)(['Admin', 'Sales', 'Warehouse']), challanController_1.updateChallanStatus);
exports.default = router;
//# sourceMappingURL=challanRoutes.js.map