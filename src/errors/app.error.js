import { ERRORS_CODES } from "./errors.codes.js";
import { errorsDictionary } from "./errors.dictionary.js";

export class AppError extends Error {
    constructor(
        code = ERRORS_CODES.INTERNAL_SERVER_ERROR,
        customMessage,
        details,
    ) {
        const errorDefinition =
            errorsDictionary[code] ||
            errorsDictionary[ERRORS_CODES.INTERNAL_SERVER_ERROR];

        super(customMessage || errorDefinition.message);

        this.code = code;
        this.statusCode = errorDefinition.statusCode;
        this.details = details;
        this.isOperational = true;
    }
}
