export class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }

    async getAll(req, res, next) {
        try {
            const orders = await this.orderService.getAll(req.query);

            res.status(200).json({
                status: "success",
                payload: orders,
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const order = await this.orderService.getById(req.params.id);

            res.status(200).json({
                status: "success",
                payload: order,
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const order = await this.orderService.create(req.body);

            res.status(201).json({
                status: "success",
                payload: order,
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const order = await this.orderService.update(
                req.params.id,
                req.body,
            );

            res.status(200).json({
                status: "success",
                payload: order,
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const order = await this.orderService.delete(req.params.id);

            res.status(200).json({
                status: "success",
                payload: order,
            });
        } catch (error) {
            next(error);
        }
    }
}
