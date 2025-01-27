import express, { Response } from 'express';
import cors from 'cors';
import hpp from 'hpp';
import { StatusCodes } from 'http-status-codes';
import { envVariablesChecker } from './utils/env';
import { errorMiddleware } from './middleware/error';
import processRouter from './process/routes';
import { redisClient } from './state/redis';
import generateRouter from './generate/routes';
import cookieParser from 'cookie-parser';
import authRouter from './auth/routes';
import { consumeFromAllQueues } from './messaging/rabbitmq';
import logger from './utils/logger';

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const corsOrigin = [process.env.CORS_ORIGIN ?? 'http://localhost:3000', 'https://lemonsqueezy.com/'];

const corsOptions = {
  origin: corsOrigin,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(authRouter);

app.use(cors(corsOptions));
app.use(hpp());
app.use(cookieParser());

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
app.use(processRouter);
app.use(generateRouter);

app.listen(port, async () => {
  // eslint-disable-next-line no-console
  console.clear();
  // Pre checks
  envVariablesChecker();

  try {
    await Promise.all([
      redisClient.connect(),
      consumeFromAllQueues()
    ]);
  } catch (e){
    logger.error({
      messages: 'Error consuming message from queue',
      functionName: 'consumeFromAllQueues',
      error: e
    });
  }
  // eslint-disable-next-line no-console
  console.log('Connected to Redis');

  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}`);
});


