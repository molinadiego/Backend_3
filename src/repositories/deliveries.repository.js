import { buildPaginationMetadata } from "../utils/pagination.js";

export class DeliveryRepository {
	constructor(deliveryModel) {
		this.deliveryModel = deliveryModel;
	}

	async findAll(filter = {}, pagination = { page: 1, limit: 10, skip: 0 }) {
		const criteria = { ...filter, isActive: true };

		const [items, total] = await Promise.all([
			this.deliveryModel
				.find(criteria)
				.populate("order")
				.populate("deliveryPerson", "name email role")
				.sort({ createdAt: -1, _id: -1 })
				.skip(pagination.skip)
				.limit(pagination.limit)
				.lean(),

			this.deliveryModel.countDocuments(criteria),
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
		return this.deliveryModel
			.findOne({ _id: id, isActive: true })
			.populate("order")
			.populate("deliveryPerson", "name email role")
			.lean();
	}

	async create(data) {
		return this.deliveryModel.create(data);
	}

	async update(id, data) {
		return this.deliveryModel.findOneAndUpdate(
			{ _id: id, isActive: true },
			data,
			{
				returnDocument: "after",
				runValidators: true,
			},
		);
	}

	async softDelete(id) {
		return this.deliveryModel.findOneAndUpdate(
			{ _id: id, isActive: true },
			{ isActive: false },
			{ returnDocument: "after" },
		);
	}

	async addProof(id, proofMetadata) {
		return this.deliveryModel
			.findOneAndUpdate(
				{ _id: id, isActive: true },
				{ $set: { proof: proofMetadata } },
				{
					returnDocument: "after",
					runValidators: true,
				},
			)
			.populate("order")
			.populate("deliveryPerson", "name email role")
			.lean();
	}
}
