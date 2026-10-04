import { ERRORS_CODES } from "../errors/errors.codes.js";
import { AppError } from "../errors/app.error.js";
import logger from "../utils/logger.js";

export class OrderService {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async getAll(filter = {}) {
        return this.orderRepository.findAll(filter);
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
