import express from 'express';
import cors from 'cors';
import { getDb } from './db/connection';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start(): Promise<void> {
  // Initialize database on startup
  await getDb();
  console.log('Database initialized');

  app.listen(PORT, () => {
    console.log(`Quiz App server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
