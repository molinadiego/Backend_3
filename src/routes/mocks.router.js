import { Router } from "express";
import { internalEndpointsMiddleware } from "../middlewares/internal-endpoints.middleware.js";

export const createMocksRouter = (mocksController) => {
    const router = Router();

    router.get("/users", mocksController.generateUsers);

    router.get("/delivery-persons", mocksController.generateDeliveryPersons);

    router.get("/orders", mocksController.generateOrders);

    router.get("/deliveries", mocksController.generateDeliveries);

    router.post("/seed", internalEndpointsMiddleware, mocksController.seed);

    return router;
};
