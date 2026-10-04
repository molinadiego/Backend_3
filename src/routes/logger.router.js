import { Router } from "express";
import { loggerTest } from "../controllers/logger.controller.js";

export const createLoggerRouter = () => {
    const router = Router();

    router.get("/loggertest", loggerTest);

    return router;
};
