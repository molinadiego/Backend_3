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
            const error = new Error("Orden no encontrada");
            error.status = 404;
            throw error;
        }

        return order;
    }

    async create(orderData) {
        return this.orderRepository.create(orderData);
    }

    async update(id, updateData) {
        const order = await this.orderRepository.update(id, updateData);

        if (!order) {
            const error = new Error("Orden no encontrada");
            error.status = 404;
            throw error;
        }

        return order;
    }

    async delete(id) {
        const order = await this.orderRepository.softDelete(id);

        if (!order) {
            const error = new Error("Orden no encontrada");
            error.status = 404;
            throw error;
        }

        return order;
    }
}
