export class UserRepository {
	constructor(userModel) {
		this.userModel = userModel;
	}

	async findAll(filter = {}) {
		return this.userModel
			.find({ ...filter, isActive: true })
			.select("-password")
			.lean();
	}

	async findById(id) {
		return this.userModel
			.findOne({ _id: id, isActive: true })
			.select("-password")
			.lean();
	}

	async findByEmail(email) {
		return this.userModel.findOne({ email, isActive: true }).lean();
	}

	async create(userData) {
		return this.userModel.create(userData);
	}

	async update(id, updateData) {
		return this.userModel
			.findOneAndUpdate({ _id: id, isActive: true }, updateData, {
				returnDocument: "after",
				runValidators: true,
			})
			.select("-password")
			.lean();
	}

	async softDelete(id) {
		return this.userModel
			.findOneAndUpdate(
				{ _id: id, isActive: true },
				{ isActive: false },
				{ returnDocument: "after" },
			)
			.select("-password")
			.lean();
	}

	async addDocument(id, documentMetadata) {
		return this.userModel
			.findOneAndUpdate(
				{ _id: id, isActive: true },
				{ $push: { documents: documentMetadata } },
				{
					returnDocument: "after",
					runValidators: true,
				},
			)
			.select("-password")
			.lean();
	}
}
