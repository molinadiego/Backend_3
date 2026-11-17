import { Router } from "express";
import { loggerTest } from "../controllers/logger.controller.js";
import { internalEndpointsMiddleware } from "../middlewares/internal-endpoints.middleware.js";

export const createLoggerRouter = () => {
	const router = Router();

	router.get("/loggerTest", internalEndpointsMiddleware, loggerTest);

	return router;
};
