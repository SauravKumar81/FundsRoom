"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const challanRoutes_1 = __importDefault(require("./routes/challanRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Fundsroom Mini ERP+CRM Portal', timestamp: new Date() });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/customers', customerRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/challans', challanRoutes_1.default);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Fundsroom Mini ERP Backend running on http://localhost:${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map