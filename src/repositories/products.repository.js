import { buildPaginationMetadata } from "../utils/pagination.js";

export class ProductRepository {
	constructor(productModel) {
		this.productModel = productModel;
	}

	async getAll(filter = {}, pagination = { page: 1, limit: 10, skip: 0 }) {
		const criteria = { ...filter, isActive: true };

		const [items, total] = await Promise.all([
			this.productModel
				.find(criteria)
				.sort({ createdAt: -1, _id: -1 })
				.skip(pagination.skip)
				.limit(pagination.limit)
				.lean(),

			this.productModel.countDocuments(criteria),
		]);

		return {
			items,
			pagination: buildPaginationMetadata({
				page: pagination.page,
				limit: pagination.limit,
				total,
			}),
		};
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
