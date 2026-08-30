import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { authRouter } from './routes/auth.routes';
import { productsRouter } from './routes/products.routes';
import { transactionsRouter } from './routes/transactions.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Comma-separated list of allowed origins, e.g. "https://your-app.vercel.app".
// Left unset, all origins are allowed — fine for local dev, but set this in
// production so only your deployed frontend can call the API.
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim());

app.use(helmet());
app.use(cors(allowedOrigins ? { origin: allowedOrigins } : undefined));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/transactions', transactionsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`ICI Tracker API listening on http://localhost:${PORT}`);
});
