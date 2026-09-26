export class MocksController {
    constructor(mocksService) {
        this.mocksService = mocksService;
    }

    generateUsers = async (req, res, next) => {
        try {
            const quantity = Number(req.query.qty) || 5;

            const users = await this.mocksService.generateUsers(quantity);

            res.json({
                status: "success",
                payload: users,
            });
        } catch (error) {
            next(error);
        }
    };

    generateOrders = async (req, res, next) => {
        try {
            const quantity = Number(req.query.qty) || 5;

            const orders = await this.mocksService.generateOrders(quantity);

            res.json({
                status: "success",
                payload: orders,
            });
        } catch (error) {
            next(error);
        }
    };

    seed = async (req, res, next) => {
        try {
            const usersQuantity = Number(req.query.users) || 5;

            const ordersQuantity = Number(req.query.orders) || 10;

            const result = await this.mocksService.seed(
                usersQuantity,
                ordersQuantity,
            );

            res.status(201).json({
                status: "success",
                payload: result,
            });
        } catch (error) {
            next(error);
        }
    };
}
