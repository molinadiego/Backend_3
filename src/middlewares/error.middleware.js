import { config } from "../config/env.config.js";
import { AppError } from "../errors/app.error.js";
import { ERRORS_CODES } from "../errors/errors.codes.js";
import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const isDevelopment = config.nodeEnv === "development";

    if (err instanceof AppError) {
        logger.warning(err.message, {
            code: err.code,
            statusCode: err.statusCode,
            path: req.originalUrl,
            method: req.method,
        });
        return res.status(err.statusCode).json({
            status: "error",
            error: err.code,
            message: err.message,
            ...(isDevelopment && err.details ? { details: err.details } : {}),
        });
    }

    logger.error(err.message || "Error inesperado", {
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
    });

    return res.status(500).json({
        status: "error",
        error: ERRORS_CODES.INTERNAL_SERVER_ERROR,
        message: "Error interno del servidor.",
        ...(isDevelopment
            ? { details: err.message || "Error inesperado" }
            : {}),
    });
};
