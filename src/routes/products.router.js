import { Router } from "express";

export const createProductRouter = (productController) => {
    const router = Router();

    router.get("/", productController.getProducts);
    router.get("/:id", productController.getProductById);
    router.post("/", productController.createProduct);
    router.put("/:id", productController.updateProduct);
    router.delete("/:id", productController.deleteProduct);
    router.patch("/:id/stock", productController.updateStock);

    return router;
};
