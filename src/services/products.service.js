import { PRODUCT_STATUS } from "../constants/index.js";

export class ProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async createProduct(data) {
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
        const status =
            newStock > 0
                ? PRODUCT_STATUS.AVAILABLE
                : PRODUCT_STATUS.OUT_OF_STOCK;

        return this.productRepository.update(id, {
            stock: newStock,
            status,
        });
    }

    async getProducts() {
        return this.productRepository.getAll();
    }

    async getProductById(id) {
        return this.productRepository.getById(id);
    }
}
