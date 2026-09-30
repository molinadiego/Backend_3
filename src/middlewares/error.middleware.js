export function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";

    return res.status(statusCode).json({
        status: status,
        statusCode: statusCode,
        message: err.message || "Error interno del servidor",
    });
}
