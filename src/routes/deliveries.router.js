import { Router } from "express";
import { uploadFile } from "../config/multer.config.js";
import { uploadErrorHandler } from "../middlewares/upload-error.middleware.js";

export const createDeliveriesRouter = (deliveryController) => {
	const router = Router();

	router.get("/", deliveryController.getAll);
	router.post("/", deliveryController.create);
	router.get("/:id/tracking", deliveryController.getTracking);
	router.get("/:id", deliveryController.getById);
	router.put("/:id", deliveryController.update);
	router.delete("/:id", deliveryController.delete);

	router.post(
		"/:id/proof",
		uploadFile.single("file"),
		uploadErrorHandler,
		deliveryController.uploadProof,
	);

	return router;
};
