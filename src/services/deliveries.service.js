import { unlink } from "node:fs/promises";
import mongoose from "mongoose";
import {
	DELIVERY_STATUS,
	DOCUMENT_TYPES,
	USER_ROLES,
} from "../constants/index.js";
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
	constructor(deliveryRepository, orderRepository, userRepository) {
		this.deliveryRepository = deliveryRepository;
		this.orderRepository = orderRepository;
		this.userRepository = userRepository;
	}

	validateId(id) {
		if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
			throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
		}
	}

	getMutableFields(data) {
		if (!data || typeof data !== "object" || Array.isArray(data)) {
			throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
		}

		const allowedFields = [
			"order",
			"deliveryPerson",
			"address",
			"status",
			"estimatedDeliveryDate",
		];
		const fields = Object.keys(data);

		if (
			fields.some((field) => !allowedFields.includes(field)) ||
			fields.length === 0
		) {
			throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
		}

		return Object.fromEntries(
			fields.map((field) => [field, data[field]]),
		);
	}

	validateDeliveryFields(data) {
		if (
			data.address !== undefined &&
			(typeof data.address !== "string" || !data.address.trim())
		) {
			throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
		}

		if (
			data.status !== undefined &&
			!Object.values(DELIVERY_STATUS).includes(data.status)
		) {
			throw new AppError(ERRORS_CODES.INVALID_DELIVERY_STATUS);
		}

		if (
			data.estimatedDeliveryDate !== undefined &&
			data.estimatedDeliveryDate !== null &&
			(typeof data.estimatedDeliveryDate !== "string" ||
				Number.isNaN(new Date(data.estimatedDeliveryDate).getTime()))
		) {
			throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
		}
	}

	async validateOrder(orderId) {
		if (typeof orderId !== "string" || !mongoose.isValidObjectId(orderId)) {
			throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
		}

		const order = await this.orderRepository.findById(orderId);

		if (!order) {
			throw new AppError(ERRORS_CODES.ORDER_NOT_FOUND);
		}
	}

	async validateDeliveryPerson(deliveryPersonId) {
		if (
			typeof deliveryPersonId !== "string" ||
			!mongoose.isValidObjectId(deliveryPersonId)
		) {
			throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
		}

		const deliveryPerson = await this.userRepository.findById(deliveryPersonId);

		if (!deliveryPerson) {
			throw new AppError(ERRORS_CODES.USER_NOT_FOUND);
		}

		if (deliveryPerson.role !== USER_ROLES.DRIVER) {
			throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
		}
	}

	async getById(id) {
		this.validateId(id);
		const delivery = await this.deliveryRepository.findById(id);

		if (!delivery) {
			throw new AppError(ERRORS_CODES.DELIVERY_NOT_FOUND);
		}

		return withoutProofPath(delivery);
	}

	async getTracking(id) {
		const delivery = await this.getById(id);

		return {
			deliveryId: delivery._id,
			order: delivery.order
				? {
						id: delivery.order._id,
						deliveryAddress: delivery.order.deliveryAddress,
						total: delivery.order.total,
						status: delivery.order.status,
						priority: delivery.order.priority,
					}
				: null,
			status: delivery.status,
			deliveryPerson: delivery.deliveryPerson
				? {
						id: delivery.deliveryPerson._id,
						name: delivery.deliveryPerson.name,
						email: delivery.deliveryPerson.email,
						role: delivery.deliveryPerson.role,
					}
				: null,
			address: delivery.address,
			estimatedDeliveryDate: delivery.estimatedDeliveryDate ?? null,
			updatedAt: delivery.updatedAt ?? null,
		};
	}

	async create(data) {
		const deliveryData = this.getMutableFields(data);

		if (
			!deliveryData.order ||
			!deliveryData.deliveryPerson ||
			!deliveryData.address
		) {
			throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
		}

		this.validateDeliveryFields(deliveryData);
		await this.validateOrder(deliveryData.order);
		await this.validateDeliveryPerson(deliveryData.deliveryPerson);

		const delivery = await this.deliveryRepository.create(deliveryData);

		return withoutProofPath(delivery);
	}

	async update(id, data) {
		this.validateId(id);
		const deliveryData = this.getMutableFields(data);

		if (deliveryData.address === "" || deliveryData.address === null) {
			throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
		}

		this.validateDeliveryFields(deliveryData);
		const existingDelivery = await this.deliveryRepository.findById(id);

		if (!existingDelivery) {
			throw new AppError(ERRORS_CODES.DELIVERY_NOT_FOUND);
		}

		if (deliveryData.order !== undefined) {
			await this.validateOrder(deliveryData.order);
		}

		if (deliveryData.deliveryPerson !== undefined) {
			await this.validateDeliveryPerson(deliveryData.deliveryPerson);
		}

		const updatedDelivery = await this.deliveryRepository.update(id, deliveryData);

		if (!updatedDelivery) {
			throw new AppError(ERRORS_CODES.DELIVERY_NOT_FOUND);
		}

		return withoutProofPath(updatedDelivery);
	}

	async delete(id) {
		this.validateId(id);
		const delivery = await this.deliveryRepository.softDelete(id);

		if (!delivery) {
			throw new AppError(ERRORS_CODES.DELIVERY_NOT_FOUND);
		}

		return withoutProofPath(delivery);
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
