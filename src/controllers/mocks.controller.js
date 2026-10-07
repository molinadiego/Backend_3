import { asyncHandler } from "../middlewares/async-handler.middleware.js";

export class MocksController {
    constructor(mocksService) {
        this.mocksService = mocksService;

        this.generateUsers = asyncHandler(this.generateUsers.bind(this));
        this.generateDeliveryPersons = asyncHandler(
            this.generateDeliveryPersons.bind(this),
        );
        this.generateOrders = asyncHandler(this.generateOrders.bind(this));
        this.generateDeliveries = asyncHandler(
            this.generateDeliveries.bind(this),
        );
        this.seed = asyncHandler(this.seed.bind(this));
    }

    async generateUsers(req, res) {
        const quantity =
            req.query.qty !== undefined ? req.query.qty : undefined;

        const users = await this.mocksService.generateUsers(quantity);

        res.json({
            status: "success",
            payload: users,
        });
    }

    async generateDeliveryPersons(req, res) {
        const quantity =
            req.query.qty !== undefined ? req.query.qty : undefined;

        const deliveryPersons =
            await this.mocksService.generateDeliveryPersons(quantity);

        res.json({
            status: "success",
            payload: deliveryPersons,
        });
    }

    async generateOrders(req, res) {
        const quantity =
            req.query.qty !== undefined ? req.query.qty : undefined;

        const orders = await this.mocksService.generateOrders(quantity);

        res.json({
            status: "success",
            payload: orders,
        });
    }

    async generateDeliveries(req, res) {
        const quantity =
            req.query.qty !== undefined ? req.query.qty : undefined;

        const deliveries = await this.mocksService.generateDeliveries(quantity);

        res.json({
            status: "success",
            payload: deliveries,
        });
    }

    async seed(req, res) {
        const usersQty =
            req.query.users !== undefined
                ? req.query.users
                : req.body?.users !== undefined
                  ? req.body.users
                  : undefined;

        const deliveryPersonsQty =
            req.query.deliveryPersons !== undefined
                ? req.query.deliveryPersons
                : req.body?.deliveryPersons !== undefined
                  ? req.body.deliveryPersons
                  : undefined;

        const ordersQty =
            req.query.orders !== undefined
                ? req.query.orders
                : req.body?.orders !== undefined
                  ? req.body.orders
                  : undefined;

        const deliveriesQty =
            req.query.deliveries !== undefined
                ? req.query.deliveries
                : req.body?.deliveries !== undefined
                  ? req.body.deliveries
                  : undefined;

        const result = await this.mocksService.seed({
            usersQty,
            deliveryPersonsQty,
            ordersQty,
            deliveriesQty,
        });

        res.status(201).json({
            status: "success",
            payload: result,
        });
    }
}
