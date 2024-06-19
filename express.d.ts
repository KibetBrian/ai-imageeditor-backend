/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';
import { User } from './middleware/types';

declare module 'express-serve-static-core' {
  interface Request {
    user: User
  }
}

