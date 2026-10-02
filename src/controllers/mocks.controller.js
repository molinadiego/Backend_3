export class MocksController {
    constructor(mocksService) {
        this.mocksService = mocksService;
    }

    generateUsers = async (req, res, next) => {
        try {
            const quantity =
                req.query.qty !== undefined ? Number(req.query.qty) : undefined;

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
            const quantity =
                req.query.qty !== undefined ? Number(req.query.qty) : undefined;

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
            const quantity =
                req.query.qty !== undefined ? Number(req.query.qty) : undefined;

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
            const quantity =
                req.query.qty !== undefined ? Number(req.query.qty) : undefined;

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
            const usersQty =
                req.query.users !== undefined
                    ? Number(req.query.users)
                    : req.body?.users !== undefined
                      ? Number(req.body.users)
                      : undefined;

            const deliveryPersonsQty =
                req.query.deliveryPersons !== undefined
                    ? Number(req.query.deliveryPersons)
                    : req.body?.deliveryPersons !== undefined
                      ? Number(req.body.deliveryPersons)
                      : undefined;

            const ordersQty =
                req.query.orders !== undefined
                    ? Number(req.query.orders)
                    : req.body?.orders !== undefined
                      ? Number(req.body.orders)
                      : undefined;

            const deliveriesQty =
                req.query.deliveries !== undefined
                    ? Number(req.query.deliveries)
                    : req.body?.deliveries !== undefined
                      ? Number(req.body.deliveries)
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
        } catch (error) {
            next(error);
        }
    };
}
