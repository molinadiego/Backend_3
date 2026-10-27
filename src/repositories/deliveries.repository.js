export class DeliveryRepository {
	constructor(deliveryModel) {
		this.deliveryModel = deliveryModel;
	}

	async findAll(filter = {}) {
		return this.deliveryModel
			.find({ ...filter, isActive: true })
			.populate("order")
			.populate("deliveryPerson", "name email role")
			.lean();
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
