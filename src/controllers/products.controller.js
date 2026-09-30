export class ProductController {
    constructor(productService) {
        this.productService = productService;
    }

    getProducts = async (req, res, next) => {
        try {
            const products = await this.productService.getProducts();
            return res.status(200).json({ status: "success", data: products });
        } catch (error) {
            next(error);
        }
    };

    getProductById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const product = await this.productService.getProductById(id);

            if (!product) {
                return res.status(404).json({
                    status: "error",
                    message: "Producto no encontrado",
                });
            }

            return res.status(200).json({ status: "success", data: product });
        } catch (error) {
            next(error);
        }
    };

    createProduct = async (req, res, next) => {
        try {
            const { name, price, stock } = req.body;

            if (!name || price === undefined) {
                return res.status(400).json({
                    status: "error",
                    message: "Nombre y precio son requeridos",
                });
            }

            const newProduct = await this.productService.createProduct({
                name,
                price,
                stock,
            });
            return res
                .status(201)
                .json({ status: "success", data: newProduct });
        } catch (error) {
            next(error);
        }
    };

    updateStock = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { stock } = req.body;

            if (stock === undefined || Number(stock) < 0) {
                return res
                    .status(400)
                    .json({ status: "error", message: "Stock inválido" });
            }

            const updatedProduct = await this.productService.updateStock(
                id,
                Number(stock),
            );
            return res
                .status(200)
                .json({ status: "success", data: updatedProduct });
        } catch (error) {
            next(error);
        }
    };
}
