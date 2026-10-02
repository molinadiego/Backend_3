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
        message:
            "El repartidor no está disponible para tomar una nueva entrega.",
    },

    [ERRORS_CODES.INVALID_MOCK_AMOUNT]: {
        statusCode: 400,
        message:
            "La cantidad de registros a poner debe ser un número positivo.",
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
};
