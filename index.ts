import express, { Response } from 'express';

const app = express();

const port = 8080;

app.get('/', (_, res: Response) => {
  res.send('Ok');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${  port}`);
});