import path from 'path';
import *  as  winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a rotating file transport
const fileTransport = new DailyRotateFile({
  filename: path.resolve(__dirname, '..', 'logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: process.env.MAXIMUM_LOG_FILE_SIZE ? `${Number(process.env.MAXIMUM_LOG_FILE_SIZE)}m` : '20m',
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

// Create a console transport
const consoleTransport = new winston.transports.Console({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
});

// Create a custom format function
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] ${message}`;
  if (metadata) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create a logger
const logger = winston.createLogger({
  transports: [fileTransport, consoleTransport],
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp(),
    customFormat
  )
});

export default logger;
