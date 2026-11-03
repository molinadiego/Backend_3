import { buildPaginationMetadata } from "../utils/pagination.js";

export class UserRepository {
	constructor(userModel) {
		this.userModel = userModel;
	}

	async findAll(filter = {}, pagination = { page: 1, limit: 10, skip: 0 }) {
		const criteria = { ...filter, isActive: true };

		const [items, total] = await Promise.all([
			this.userModel
				.find(criteria)
				.select("-password")
				.sort({ createdAt: -1, _id: -1 })
				.skip(pagination.skip)
				.limit(pagination.limit)
				.lean(),

			this.userModel.countDocuments(criteria),
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
