import { unlink } from "node:fs/promises";
import mongoose from "mongoose";
import { DELIVERY_STATUS, DOCUMENT_TYPES } from "../constants/index.js";
import { AppError } from "../errors/app.error.js";
import { ERRORS_CODES } from "../errors/errors.codes.js";
import logger from "../utils/logger.js";
import { parsePagination } from "../utils/pagination.js";
import { getRelativeUploadPath } from "../config/multer.config.js";

const withoutProofPath = (delivery) => {
	const deliveryObject = delivery?.toObject?.() ?? delivery;

	if (!deliveryObject?.proof) {
		return deliveryObject;
	}

	const { path: filePath, ...proof } = deliveryObject.proof;

	return {
		...deliveryObject,
		proof,
	};
};

export class DeliveryService {
	constructor(deliveryRepository) {
		this.deliveryRepository = deliveryRepository;
	}

	async getAll(query = {}) {
		const pagination = parsePagination(query);
		const filter = {};

		if (query.status) {
			if (!Object.values(DELIVERY_STATUS).includes(query.status)) {
				throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
			}

			filter.status = query.status;
		}

		if (query.deliveryPerson) {
			if (!mongoose.isValidObjectId(query.deliveryPerson)) {
				throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
			}

			filter.deliveryPerson = query.deliveryPerson;
		}

		if (query.order) {
			if (!mongoose.isValidObjectId(query.order)) {
				throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
			}

			filter.order = query.order;
		}

		const result = await this.deliveryRepository.findAll(filter, pagination);

		return {
			...result,
			items: result.items.map(withoutProofPath),
		};
	}

	async uploadProof(id, file) {
		if (!file) {
			throw new AppError(ERRORS_CODES.FILE_REQUIRED);
		}

		try {
			const delivery = await this.deliveryRepository.findById(id);

			if (!delivery) {
				throw new AppError(ERRORS_CODES.DELIVERY_NOT_FOUND);
			}

			const proofMetadata = {
				originalName: file.originalname,
				filename: file.filename,
				path: getRelativeUploadPath(file.path),
				mimetype: file.mimetype,
				size: file.size,
				documentType: DOCUMENT_TYPES.DELIVERY_PROOF,
				uploadedAt: new Date(),
			};

			const updatedDelivery = await this.deliveryRepository.addProof(
				id,
				proofMetadata,
			);

			if (!updatedDelivery) {
				throw new AppError(ERRORS_CODES.DELIVERY_NOT_FOUND);
			}

			logger.info("Comprobante de entrega cargado correctamente", {
				deliveryId: id,
				filename: file.filename,
				size: file.size,
			});

			return withoutProofPath(updatedDelivery);
		} catch (error) {
			try {
				await unlink(file.path);
			} catch (cleanupError) {
				if (cleanupError.code !== "ENOENT") {
					logger.error("No se pudo eliminar el comprobante tras un error", {
						filename: file.filename,
						error: cleanupError.message,
					});
				}
			}

			if (error instanceof AppError) {
				throw error;
			}

			logger.error("Error al guardar comprobante de entrega", {
				deliveryId: id,
				filename: file.filename,
				error: error.message,
			});

			throw new AppError(ERRORS_CODES.DELIVERY_PROOF_UPLOAD_FAILED);
		}
	}
}
