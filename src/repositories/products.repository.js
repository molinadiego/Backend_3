export class ProductRepository {
	constructor(productModel) {
		this.productModel = productModel;
	}

	async getAll(filter = {}) {
		return this.productModel.find({ ...filter, isActive: true }).lean();
	}

	async getById(id) {
		return this.productModel.findOne({ _id: id, isActive: true }).lean();
	}

	async create(productData) {
		return this.productModel.create(productData);
	}

	async update(id, updateData) {
		return this.productModel.findOneAndUpdate(
			{ _id: id, isActive: true },
			updateData,
			{
				returnDocument: "after",
				runValidators: true,
			},
		);
	}

	async softDelete(id) {
		return this.productModel.findOneAndUpdate(
			{ _id: id, isActive: true },
			{ isActive: false },
			{ returnDocument: "after" },
		);
	}
}
