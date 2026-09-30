export class MocksController {
    constructor(mocksService) {
        this.mocksService = mocksService;
    }

    normalizeQuantity(value, defaultValue = 5) {
        if (value === undefined) {
            return defaultValue;
        }

        const quantity = Number(value);

        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error("La cantidad debe ser un entero mayor o igual a 1");
        }

        return Math.min(quantity, 50);
    }

    generateUsers = async (req, res, next) => {
        try {
            const quantity = this.normalizeQuantity(req.query.qty);

            const users = await this.mocksService.generateUsers(quantity);

            res.json({
                status: "success",
                payload: users,
            });
        } catch (error) {
            next(error);
        }
    };

    generateDeliveryPersons = async (req, res, next) => {
        try {
            const quantity = this.normalizeQuantity(req.query.qty);

            const deliveryPersons =
                await this.mocksService.generateDeliveryPersons(quantity);

            res.json({
                status: "success",
                payload: deliveryPersons,
            });
        } catch (error) {
            next(error);
        }
    };

    generateOrders = async (req, res, next) => {
        try {
            const quantity = this.normalizeQuantity(req.query.qty);

            const orders = await this.mocksService.generateOrders(quantity);

            res.json({
                status: "success",
                payload: orders,
            });
        } catch (error) {
            next(error);
        }
    };

    generateDeliveries = async (req, res, next) => {
        try {
            const quantity = this.normalizeQuantity(req.query.qty);

            const deliveries =
                await this.mocksService.generateDeliveries(quantity);

            res.json({
                status: "success",
                payload: deliveries,
            });
        } catch (error) {
            next(error);
        }
    };

    seed = async (req, res, next) => {
        try {
            const usersQty = this.normalizeQuantity(
                req.query.users ?? req.body.users,
                5,
            );

            const deliveryPersonsQty = this.normalizeQuantity(
                req.query.deliveryPersons ?? req.body.deliveryPersons,
                3,
            );

            const ordersQty = this.normalizeQuantity(
                req.query.orders ?? req.body.orders,
                10,
            );

            const deliveriesQty = this.normalizeQuantity(
                req.query.deliveries ?? req.body.deliveries,
                5,
            );

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
        } catch (error) {
            next(error);
        }
    };
}
