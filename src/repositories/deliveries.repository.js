export class DeliveryRepository {
    constructor(deliveryModel) {
        this.deliveryModel = deliveryModel;
    }

    async findAll(filter = {}) {
        return this.deliveryModel
            .find({
                ...filter,
                isActive: true,
            })
            .populate("order")
            .populate("deliveryPerson", "name email role")
            .lean();
    }

    async findById(id) {
        return this.deliveryModel
            .findOne({
                _id: id,
                isActive: true,
            })
            .populate("order")
            .populate("deliveryPerson", "name email role")
            .lean();
    }

    async create(data) {
        return this.deliveryModel.create(data);
    }

    async update(id, data) {
        return this.deliveryModel.findOneAndUpdate(
            {
                _id: id,
                isActive: true,
            },
            data,
            {
                new: true,
                runValidators: true,
            },
        );
    }

    async softDelete(id) {
        return this.deliveryModel.findOneAndUpdate(
            {
                _id: id,
                isActive: true,
            },
            {
                isActive: false,
            },
            {
                new: true,
            },
        );
    }
}
