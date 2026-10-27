import { Router } from "express";
import { uploadFile } from "../config/multer.config.js";
import { uploadErrorHandler } from "../middlewares/upload-error.middleware.js";

export const createUsersRouter = (userController) => {
	const router = Router();

	router.get("/", userController.getAll);
	router.get("/:id", userController.getById);
	router.post("/", userController.create);
	router.post(
		"/:id/documents",
		uploadFile.single("file"),
		uploadErrorHandler,
		userController.uploadDocument,
	);
	router.put("/:id", userController.update);
	router.delete("/:id", userController.delete);

	return router;
};
