export class ProductController {
    constructor(productService) {
        this.productService = productService;
    }

    async getAll(req, res, next) {
        try {
            const products = await this.productService.getProducts();
            res.status(200).json({ status: "success", data: products });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const product = await this.productService.getProductById(
                req.params.id,
            );
            res.status(200).json({ status: "success", data: product });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newProduct = await this.productService.createProduct(
                req.body,
            );
            res.status(201).json({ status: "success", data: newProduct });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updated = await this.productService.updateProduct(
                req.params.id,
                req.body,
            );
            res.status(200).json({ status: "success", data: updated });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await this.productService.deleteProduct(req.params.id);
            res.status(200).json({
                status: "success",
                message: "Producto eliminado correctamente",
            });
        } catch (error) {
            next(error);
        }
    }
}
