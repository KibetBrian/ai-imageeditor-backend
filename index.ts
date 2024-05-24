import express, { Response } from 'express';
import cors from 'cors';
import hpp from 'hpp';
import { StatusCodes } from 'http-status-codes';
import { envVariablesChecker } from './utils/env';
import { errorMiddleware } from './middleware/error';

const app = express();

app.use(express.json());

const corsOrigin = [process.env.CORS_ORIGIN ?? 'http://localhost:3000', 'https://lemonsqueezy.com/'];

const corsOptions = {
  origin: corsOrigin,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(hpp());

// Allow prisma to serialize bigint
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const port = process.env.APPLICATION_PORT;

app.get('/health', (req, res: Response) => {
  res.status(StatusCodes.OK).send('OK');
});

app.use(errorMiddleware);

app.listen(port, () => {
  // Pre checks
  envVariablesChecker();

  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}`);
});