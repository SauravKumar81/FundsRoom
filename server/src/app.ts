import express from 'express';
import cors from 'cors';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import challanRoutes from './routes/challanRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

// Ensure Database Schema is pushed and seeded in deployed environments
try {
  console.log('🔄 Checking database schema and seeding...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  execSync('npx tsx src/prisma/seed.ts', { stdio: 'inherit' });
  console.log('✅ Database initialization complete.');
} catch (err) {
  console.warn('⚠️ Automated database push/seed skipped or failed:', err);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Fundsroom Mini ERP+CRM Portal', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Fundsroom Mini ERP Backend running on http://localhost:${PORT}`);
});

export default app;
