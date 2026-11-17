import { config } from "../config/env.config.js";
import winston from "winston";

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
	level: "debug",
	format: consoleFormat,
});

const errorFileTransport = new winston.transports.File({
	filename: "log/error.log",
	level: "error",
	format: logFormat,
});

const combinedFileTransport = new winston.transports.File({
	filename: "log/combined.log",
	level: "debug",
	format: logFormat,
});

const transports = [errorFileTransport, combinedFileTransport];

if (config.nodeEnv === "development") {
	transports.push(consoleTransport);
}

const logger = winston.createLogger({
	levels: customLevels.levels,
	level: "debug",
	format: logFormat,
	transports,
});

export default logger;
