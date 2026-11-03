import { buildPaginationMetadata } from "../utils/pagination.js";

export class OrderRepository {
	constructor(orderModel) {
		this.orderModel = orderModel;
	}

	async findAll(filter = {}, pagination = { page: 1, limit: 10, skip: 0 }) {
		const criteria = { ...filter, isActive: true };

		const [items, total] = await Promise.all([
			this.orderModel
				.find(criteria)
				.populate("userId", "name email")
				.sort({ createdAt: -1, _id: -1 })
				.skip(pagination.skip)
				.limit(pagination.limit)
				.lean(),

			this.orderModel.countDocuments(criteria),
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

	async findById(id) {
		return this.orderModel
			.findOne({ _id: id, isActive: true })
			.populate("userId", "name email")
			.lean();
	}

	async create(orderData) {
		return this.orderModel.create(orderData);
	}

	async update(id, updateData) {
		return this.orderModel.findOneAndUpdate(
			{ _id: id, isActive: true },
			updateData,
			{
				returnDocument: "after",
				runValidators: true,
			},
		);
	}

	async softDelete(id) {
		return this.orderModel.findOneAndUpdate(
			{ _id: id, isActive: true },
			{ isActive: false },
			{ returnDocument: "after" },
		);
	}
}
