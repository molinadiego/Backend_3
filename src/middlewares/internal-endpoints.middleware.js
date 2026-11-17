import { config } from "../config/env.config.js";
import { routeNotFound } from "./notfound.middleware.js";

export const internalEndpointsMiddleware = (req, res, next) => {
	if (config.nodeEnv === "production") {
		return routeNotFound(req, res, next);
	}

	return next();
};
