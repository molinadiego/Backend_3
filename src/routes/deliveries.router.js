import { Router } from "express";
import { uploadFile } from "../config/multer.config.js";
import { uploadErrorHandler } from "../middlewares/upload-error.middleware.js";

export const createDeliveriesRouter = (deliveryController) => {
	const router = Router();

	router.get("/", deliveryController.getAll);

	router.post(
		"/:id/proof",
		uploadFile.single("file"),
		uploadErrorHandler,
		deliveryController.uploadProof,
	);

	return router;
};
