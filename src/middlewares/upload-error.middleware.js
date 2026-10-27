import multer from "multer";
import { AppError } from "../errors/app.error.js";
import { ERRORS_CODES } from "../errors/errors.codes.js";
import logger from "../utils/logger.js";

export const uploadErrorHandler = (error, req, res, next) => {
	if (error instanceof AppError) {
		return next(error);
	}

	if (error.message === "INVALID_FILE_TYPE") {
		logger.warning("Archivo rechazado por tipo no permitido", {
			path: req.originalUrl,
			method: req.method,
		});

		return next(new AppError(ERRORS_CODES.INVALID_FILE_TYPE));
	}

	if (error instanceof multer.MulterError) {
		let errorCode;

		switch (error.code) {
			case "LIMIT_FILE_SIZE":
				errorCode = ERRORS_CODES.FILE_TOO_LARGE;
				break;

			case "LIMIT_UNEXPECTED_FILE":
			case "LIMIT_FILE_COUNT":
			case "LIMIT_FIELD_COUNT":
			case "LIMIT_FIELD_KEY":
			case "LIMIT_FIELD_VALUE":
				errorCode = ERRORS_CODES.UNEXPECTED_FILE_FIELD;
				break;

			default:
				logger.error("Error de Multer no clasificado", {
					code: error.code,
					path: req.originalUrl,
					method: req.method,
				});

				return next(error);
		}

		logger.warning("Error durante la carga de archivos", {
			code: error.code,
			path: req.originalUrl,
			method: req.method,
		});

		return next(new AppError(errorCode));
	}

	return next(error);
};
