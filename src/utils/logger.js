import { config } from "../config/env.config.js";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    colors: {
        fatal: "red bold",
        error: "red",
        warning: "yellow",
        info: "green",
        http: "cyan",
        debug: "blue",
    },
};

winston.addColors(customLevels);

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH-mm-ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "HH-mm-ss" }),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        const hasMetadata = Object.keys(metadata).length > 0;
        const metadataText = hasMetadata ? `${JSON.stringify(metadata)}` : " ";
        return `${timestamp} [${level}] ${message} ${metadataText}`;
    }),
);

const consoleTransport = new winston.transports.Console({
    level: config.nodeEnv === "production" ? "info" : "debug",
    format: consoleFormat,
});

const errorRotateTransport = new DailyRotateFile({
    filename: "log/errors-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxFiles: "14d",
    format: logFormat,
});

const logger = winston.createLogger({
    levels: customLevels.levels,
    level: config.nodeEnv === "production" ? "info" : "debug",
    format: logFormat,
    transports: [consoleTransport, errorRotateTransport],
});

export default logger;
