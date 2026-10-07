import { asyncHandler } from "../middlewares/async-handler.middleware.js";

export class ProductController {
    constructor(productService) {
        this.productService = productService;

        this.getProducts = asyncHandler(this.getProducts.bind(this));
        this.getProductById = asyncHandler(this.getProductById.bind(this));
        this.createProduct = asyncHandler(this.createProduct.bind(this));
        this.updateStock = asyncHandler(this.updateStock.bind(this));
    }

    async getProducts(req, res) {
        const products = await this.productService.getProducts();

        return res.status(200).json({
            status: "success",
            data: products,
        });
    }

    async getProductById(req, res) {
        const { id } = req.params;
        const product = await this.productService.getProductById(id);

        return res.status(200).json({
            status: "success",
            data: product,
        });
    }

    async createProduct(req, res) {
        const { name, price, stock } = req.body;

        const newProduct = await this.productService.createProduct({
            name,
            price,
            stock,
        });

        return res.status(201).json({
            status: "success",
            data: newProduct,
        });
    }

    async updateStock(req, res) {
        const { id } = req.params;
        const { stock } = req.body;

        const updatedProduct = await this.productService.updateStock(
            id,
            Number(stock),
        );

        return res.status(200).json({
            status: "success",
            data: updatedProduct,
        });
    }
}
