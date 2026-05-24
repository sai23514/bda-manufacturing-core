import winston from 'winston';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { combine, timestamp, printf, colorize, errors } = winston.format;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDirectory = path.resolve(__dirname, '../../logs');

fs.mkdirSync(logDirectory, { recursive: true });

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logDirectory, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: path.join(logDirectory, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDirectory, 'exceptions.log') })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDirectory, 'rejections.log') })
  ]
});

export default logger;
