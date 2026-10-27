import { ERRORS_CODES } from "./errors.codes.js";

export const errorsDictionary = {
	[ERRORS_CODES.VALIDATION_ERROR]: {
		statusCode: 400,
		message: "Los datos enviados no son válidos.",
	},
	[ERRORS_CODES.USER_NOT_FOUND]: {
		statusCode: 404,
		message: "No se encontró el usuario solicitado.",
	},
	[ERRORS_CODES.ORDER_NOT_FOUND]: {
		statusCode: 404,
		message: "No se encontró el pedido solicitado.",
	},
	[ERRORS_CODES.DELIVERY_NOT_FOUND]: {
		statusCode: 404,
		message: "No se encontró la entrega solicitada.",
	},
	[ERRORS_CODES.INVALID_ORDER_STATUS]: {
		statusCode: 400,
		message: "El estado indicado no es válido para un pedido.",
	},
	[ERRORS_CODES.INVALID_DELIVERY_STATUS]: {
		statusCode: 400,
		message: "El estado indicado no es válido para una entrega.",
	},
	[ERRORS_CODES.DRIVER_NOT_AVAILABLE]: {
		statusCode: 409,
		message: "El repartidor no está disponible para tomar una nueva entrega.",
	},
	[ERRORS_CODES.INVALID_MOCK_AMOUNT]: {
		statusCode: 400,
		message: "La cantidad de registros solicitada no es válida.",
	},
	[ERRORS_CODES.ROUTE_NOT_FOUND]: {
		statusCode: 404,
		message: "La ruta solicitada no existe.",
	},
	[ERRORS_CODES.INTERNAL_SERVER_ERROR]: {
		statusCode: 500,
		message: "Error interno del servidor.",
	},
	[ERRORS_CODES.PRODUCT_NOT_FOUND]: {
		statusCode: 404,
		message: "No se encontró el producto.",
	},
	[ERRORS_CODES.FILE_REQUIRED]: {
		statusCode: 400,
		message: "Es obligatorio adjuntar un archivo.",
	},
	[ERRORS_CODES.INVALID_FILE_TYPE]: {
		statusCode: 400,
		message:
			"El tipo de archivo no está permitido. Solo se aceptan PDF, JPEG, PNG y WebP.",
	},
	[ERRORS_CODES.FILE_TOO_LARGE]: {
		statusCode: 400,
		message: "El archivo supera el tamaño máximo permitido de 5 MB.",
	},
	[ERRORS_CODES.UNEXPECTED_FILE_FIELD]: {
		statusCode: 400,
		message:
			"El campo del archivo es incorrecto o se enviaron demasiados archivos.",
	},
	[ERRORS_CODES.INVALID_DOCUMENT_TYPE]: {
		statusCode: 400,
		message: "El tipo de documento indicado no es válido.",
	},
	[ERRORS_CODES.DOCUMENT_UPLOAD_FAILED]: {
		statusCode: 500,
		message: "No se pudo guardar el documento del usuario.",
	},
	[ERRORS_CODES.DELIVERY_PROOF_UPLOAD_FAILED]: {
		statusCode: 500,
		message: "No se pudo guardar el comprobante de entrega.",
	},
};
