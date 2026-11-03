import { ORDER_STATUS, DELIVERY_PRIORITY } from "../constants/index.js";
import { ERRORS_CODES } from "../errors/errors.codes.js";
import { AppError } from "../errors/app.error.js";
import logger from "../utils/logger.js";
import { parsePagination } from "../utils/pagination.js";
import mongoose from "mongoose";

export class OrderService {
	constructor(orderRepository) {
		this.orderRepository = orderRepository;
	}

	async getAll(query = {}) {
		const pagination = parsePagination(query);
		const filter = {};

		if (query.status) {
			if (!Object.values(ORDER_STATUS).includes(query.status)) {
				throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
			}

			filter.status = query.status;
		}

		if (query.priority) {
			if (!Object.values(DELIVERY_PRIORITY).includes(query.priority)) {
				throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
			}

			filter.priority = query.priority;
		}

		if (query.userId) {
			if (!mongoose.isValidObjectId(query.userId)) {
				throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
			}

			filter.userId = query.userId;
		}

		return this.orderRepository.findAll(filter, pagination);
	}

	async getById(id) {
		const order = await this.orderRepository.findById(id);

		if (!order) {
			throw new AppError(ERRORS_CODES.ORDER_NOT_FOUND);
		}

		return order;
	}

	async create(orderData) {
		const orderCreated = await this.orderRepository.create(orderData);

		logger.info("Orden creada.", {
			orderId: orderCreated._id,
		});

		return orderCreated;
	}

	async update(id, updateData) {
		const order = await this.orderRepository.update(id, updateData);

		if (!order) {
			throw new AppError(ERRORS_CODES.ORDER_NOT_FOUND);
		}

		return order;
	}

	async delete(id) {
		const order = await this.orderRepository.softDelete(id);

		if (!order) {
			throw new AppError(ERRORS_CODES.ORDER_NOT_FOUND);
		}

		return order;
	}
}
