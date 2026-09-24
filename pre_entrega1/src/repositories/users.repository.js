import { UserModel } from "../models/user.model.js";

export class UserRepository {
    async findAll(filter = {}) {
        return UserModel.find({ isActive: true, ...filter })
            .select("-password")
            .lean();
    }

    async findById(id) {
        return UserModel.findOne({ _id: id, isActive: true }).select(
            "-password",
        );
    }

    async findByEmail(email) {
        return UserModel.findOne({ email, isActive: true });
    }

    async create(userData) {
        return UserModel.create(userData);
    }

    async update(id, updateData) {
        return UserModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");
    }

    async softDelete(id) {
        return UserModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true },
        );
    }
}
