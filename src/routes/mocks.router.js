import { Router } from "express";

export const createMocksRouter = (mocksController) => {
    const router = Router();

    router.get("/users", mocksController.generateUsers);

    router.get("/delivery-persons", mocksController.generateDeliveryPersons);

    router.get("/orders", mocksController.generateOrders);

    router.get("/deliveries", mocksController.generateDeliveries);

    router.post("/seed", mocksController.seed);

    return router;
};
