export class OrderRepository {
    constructor(orderModel) {
        this.orderModel = orderModel;
    }

    async findAll(filter = {}) {
        return this.orderModel
            .find({ ...filter, isActive: true })
            .populate("userId", "name email")
            .lean();
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
                new: true,
                runValidators: true,
            },
        );
    }

    async softDelete(id) {
        return this.orderModel.findOneAndUpdate(
            { _id: id, isActive: true },
            { isActive: false },
            { new: true },
        );
    }
}
