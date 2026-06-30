import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import { seedDatabase } from './utils/seed.js';

import authRouter from './routes/auth.js';
import issuesRouter from './routes/issues.js';
import adminRouter from './routes/admin.js';
import departmentRouter from './routes/department.js';
import escalationRouter from './routes/escalation.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/static', express.static(path.join(__dirname, 'static')));

connectDB().then(() => {
  seedDatabase();
});

app.use('/auth', authRouter);
app.use('/issues', issuesRouter);
app.use('/admin', adminRouter);
app.use('/department', departmentRouter);
app.use('/escalation', escalationRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Public-Eye API (Node.js/Express)',
    version: '1.0.0',
    docs: null,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    detail: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
