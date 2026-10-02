import { PRODUCT_STATUS } from "../constants/index.js";
import { ERRORS_CODES } from "../errors/errors.codes.js";
import { AppError } from "../errors/app.error.js";

export class ProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async createProduct(data) {
        if (
            typeof data.name !== "string" ||
            data.name.trim() === "" ||
            !Number.isFinite(data.price) ||
            data.price < 0 ||
            !Number.isFinite(data.stock) ||
            data.stock < 0
        ) {
            throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
        }
        const status =
            data.stock > 0
                ? PRODUCT_STATUS.AVAILABLE
                : PRODUCT_STATUS.OUT_OF_STOCK;

        return this.productRepository.create({
            ...data,
            status,
        });
    }

    async updateStock(id, newStock) {
        if (!Number.isFinite(newStock) || newStock < 0) {
            throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
        }
        const status =
            newStock > 0
                ? PRODUCT_STATUS.AVAILABLE
                : PRODUCT_STATUS.OUT_OF_STOCK;

        const product = await this.productRepository.update(id, {
            stock: newStock,
            status,
        });

        if (!product) {
            throw new AppError(ERRORS_CODES.PRODUCT_NOT_FOUND);
        }

        return product;
    }

    async getProducts() {
        return this.productRepository.getAll();
    }

    async getProductById(id) {
        const product = await this.productRepository.getById(id);

        if (!product) {
            throw new AppError(ERRORS_CODES.PRODUCT_NOT_FOUND);
        }

        return product;
    }
}
