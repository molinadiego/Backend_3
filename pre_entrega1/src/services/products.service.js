export class ProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async getProducts() {
        return this.productRepository.findAll();
    }

    async getProductById(id) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new Error("Producto no encontrado");
        }
        return product;
    }

    async createProduct(data) {
        if (!data.name || data.price === undefined) {
            throw new Error("El nombre y el precio son obligatorios");
        }

        if (data.price < 0) {
            throw new Error("El precio no puede ser negativo");
        }

        return this.productRepository.create(data);
    }

    async updateProduct(id, data) {
        await this.getProductById(id);
        return this.productRepository.update(id, data);
    }

    async deleteProduct(id) {
        await this.getProductById(id);
        return this.productRepository.softDelete(id);
    }
}
