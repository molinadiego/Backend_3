import { AppError } from "../errors/app.error.js";
import { ERRORS_CODES } from "../errors/errors.codes.js";

export const routeNotFound = (req, res, next) => {
    next(
        new AppError(
            ERRORS_CODES.ROUTE_NOT_FOUND,
            undefined,
            `${req.method} ${req.originalUrl}`,
        ),
    );
};
