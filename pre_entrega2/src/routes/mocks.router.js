import { Router } from "express";

export const createMocksRouter = (mocksController) => {
    const router = Router();

    router.get("/users", mocksController.generateUsers);

    router.get("/orders", mocksController.generateOrders);

    router.post("/seed", mocksController.seed);

    return router;
};
