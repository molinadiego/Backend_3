import { asyncHandler } from "../middlewares/async-handler.middleware.js";

export class OrderController {
    constructor(orderService) {
        this.orderService = orderService;

        this.getAll = asyncHandler(this.getAll.bind(this));
        this.getById = asyncHandler(this.getById.bind(this));
        this.create = asyncHandler(this.create.bind(this));
        this.update = asyncHandler(this.update.bind(this));
        this.delete = asyncHandler(this.delete.bind(this));
    }

    async getAll(req, res) {
        const orders = await this.orderService.getAll(req.query);

        res.status(200).json({
            status: "success",
            payload: orders,
        });
    }

    async getById(req, res) {
        const order = await this.orderService.getById(req.params.id);

        res.status(200).json({
            status: "success",
            payload: order,
        });
    }

    async create(req, res) {
        const order = await this.orderService.create(req.body);

        res.status(201).json({
            status: "success",
            payload: order,
        });
    }

    async update(req, res) {
        const order = await this.orderService.update(req.params.id, req.body);

        res.status(200).json({
            status: "success",
            payload: order,
        });
    }

    async delete(req, res) {
        const order = await this.orderService.delete(req.params.id);

        res.status(200).json({
            status: "success",
            payload: order,
        });
    }
}
