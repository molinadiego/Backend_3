import { AppError } from "../errors/app.error.js";
import { ERRORS_CODES } from "../errors/errors.codes.js";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

const parsePositiveInteger = (value, fallback) => {
	if (value === undefined || value === "") {
		return fallback;
	}

	const parsed = Number(value);

	if (!Number.isSafeInteger(parsed) || parsed < 1) {
		throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
	}

	return parsed;
};

export const parsePagination = (query = {}) => {
	const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
	const requestedLimit = parsePositiveInteger(query.limit, DEFAULT_LIMIT);
	const limit = Math.min(requestedLimit, MAX_LIMIT);
	const skip = (page - 1) * limit;

	if (!Number.isSafeInteger(skip)) {
		throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
	}

	return {
		page,
		limit,
		skip,
	};
};

export const buildPaginationMetadata = ({ page, limit, total }) => ({
	page,
	limit,
	total,
	totalPages: Math.ceil(total / limit),
});
