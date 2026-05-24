import winston from 'winston';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const transports = [
  new winston.transports.Console({
    format: combine(colorize(), logFormat)
  })
];

const exceptionHandlers = [
  new winston.transports.Console({
    format: combine(colorize(), logFormat)
  })
];

const rejectionHandlers = [
  new winston.transports.Console({
    format: combine(colorize(), logFormat)
  })
];

// Only use file transports in development (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const logDirectory = path.resolve(__dirname, '../../logs');

  fs.mkdirSync(logDirectory, { recursive: true });

  transports.push(
    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  );

  exceptionHandlers.push(
    new winston.transports.File({ filename: path.join(logDirectory, 'exceptions.log') })
  );

  rejectionHandlers.push(
    new winston.transports.File({ filename: path.join(logDirectory, 'rejections.log') })
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports,
  exceptionHandlers,
  rejectionHandlers
});

export default logger;
