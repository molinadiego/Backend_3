import { expect } from "chai";

import { AppError } from "../src/errors/app.error.js";
import { ERRORS_CODES } from "../src/errors/errors.codes.js";
import {
	DEFAULT_LIMIT,
	DEFAULT_PAGE,
	MAX_LIMIT,
	buildPaginationMetadata,
	parsePagination,
} from "../src/utils/pagination.js";

const captureError = (callback) => {
	try {
		callback();
	} catch (error) {
		return error;
	}

	return null;
};

describe("Pagination utility", () => {
	it("debería aplicar page y limit por defecto", () => {
		expect(parsePagination()).to.deep.equal({
			page: DEFAULT_PAGE,
			limit: DEFAULT_LIMIT,
			skip: 0,
		});

		expect(parsePagination({ page: "", limit: "" })).to.deep.equal({
			page: DEFAULT_PAGE,
			limit: DEFAULT_LIMIT,
			skip: 0,
		});
	});

	it("debería calcular el offset y limitar limit al máximo", () => {
		expect(parsePagination({ page: "3", limit: "101" })).to.deep.equal({
			page: 3,
			limit: MAX_LIMIT,
			skip: 200,
		});
	});

	it("debería construir toda la metadata de paginación", () => {
		expect(
			buildPaginationMetadata({ page: 2, limit: 10, total: 21 }),
		).to.deep.equal({
			page: 2,
			limit: 10,
			total: 21,
			totalPages: 3,
		});
	});

	for (const [parameter, value] of [
		["page", -1],
		["page", 0],
		["page", 1.5],
		["page", "texto"],
		["page", Number.MAX_SAFE_INTEGER + 1],
		["limit", -1],
		["limit", 0],
		["limit", 1.5],
		["limit", "texto"],
	]) {
		it(`debería rechazar ${parameter} inválido: ${value}`, () => {
			const error = captureError(() =>
				parsePagination({ [parameter]: value }),
			);

			expect(error).to.be.instanceOf(AppError);
			expect(error.code).to.equal(ERRORS_CODES.VALIDATION_ERROR);
		});
	}

	it("debería rechazar offsets fuera del rango seguro de JavaScript", () => {
		const error = captureError(() =>
			parsePagination({ page: Number.MAX_SAFE_INTEGER, limit: MAX_LIMIT }),
		);

		expect(error).to.be.instanceOf(AppError);
		expect(error.code).to.equal(ERRORS_CODES.VALIDATION_ERROR);
	});
});
