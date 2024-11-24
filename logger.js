const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const { combine, timestamp, printf, json, errors } = winston.format;

// Define the log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    if (stack) {
        logMessage += `\nStack trace: ${stack}`;
    }
    if (Object.keys(metadata).length) {
        logMessage += `\nContext: ${JSON.stringify(metadata)}`;
    }
    return logMessage;
});

// Create logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Set log level based on environment
    format: combine(
        timestamp(),
        errors({ stack: true }),  // Add stack trace for errors
        logFormat
    ),
    transports: [
        // Log to console in production and development environments
        new winston.transports.Console({
            format: combine(
                winston.format.colorize(), // Colorize log output in console
                winston.format.simple() // Log simple format to console
            ),
        }),

        // Log to a file in production
        //all logs
        // new winston.transports.File({
        //     filename: 'logs/app.log',
        //     level: 'info',
        //     format: combine(timestamp(),json()), // Write logs in JSON format for better structure
        // }),
        // // error logs and above
        // new winston.transports.File({
        //     filename: 'logs/app-error.log',
        //     level: 'error',
        //     format: (timestamp(),json())
        // }),

        new DailyRotateFile({
            filename: 'logs/%DATE%-app.log', // Log files with date in the filename
            datePattern: 'YYYY-MM-DD',
            level: 'info',
            format: combine(timestamp(), json()),
            maxSize: '20m', // Max file size before rotation
            maxFiles: '14d', // Retain logs for 14 days
        }),

        new DailyRotateFile({
            filename: 'logs/%DATE%-app-error.log', // Log files with date in the filename
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            format: combine(timestamp(), json()),
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
});

// Add custom methods for structured logging
logger.addContext = (context) => {
    return {
        ...context,
        requestId: context.requestId || Math.floor(Math.random() * 1e6), // Generate unique requestId for traceability
    };
};

module.exports = logger;
