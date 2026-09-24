import { ProductModel } from "../models/product.model.js";

export class ProductRepository {
    async findAll(filter = {}) {
        return ProductModel.find({ isActive: true, ...filter }).lean();
    }

    async findById(id) {
        return ProductModel.findOne({ _id: id, isActive: true });
    }

    async create(productData) {
        return ProductModel.create(productData);
    }

    async update(id, updateData) {
        return ProductModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
    }

    async softDelete(id) {
        return ProductModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true },
        );
    }
}
