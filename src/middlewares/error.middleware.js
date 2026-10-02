import { config } from "../config/env.config.js";
import { AppError } from "../errors/app.error.js";
import { ERRORS_CODES } from "../errors/errors.codes.js";

export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const isDevelopment = config.NODE_ENV === "development";

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: "error",
            error: err.code,
            message: err.message,
            ...(isDevelopment && err.details ? { details: err.details } : {}),
        });
    }

    console.error(err);

    return res.status(500).json({
        status: "error",
        error: ERRORS_CODES.INTERNAL_SERVER_ERROR,
        message: "Error interno del servidor.",
        ...(isDevelopment
            ? { details: err.message || "Error inesperado" }
            : {}),
    });
};
