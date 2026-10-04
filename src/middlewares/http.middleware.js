import logger from "../utils/logger.js";

export const httpMiddleware = (req, res, next) => {
    res.on("finish", () => {
        logger.http("HTTP", {
            path: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode,
        });
    });

    next();
};
