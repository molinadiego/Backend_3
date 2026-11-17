import { asyncHandler } from "../middlewares/async-handler.middleware.js";

export class DeliveryController {
	constructor(deliveryService) {
		this.deliveryService = deliveryService;

		this.getAll = asyncHandler(this.getAll.bind(this));
		this.getById = asyncHandler(this.getById.bind(this));
		this.getTracking = asyncHandler(this.getTracking.bind(this));
		this.create = asyncHandler(this.create.bind(this));
		this.update = asyncHandler(this.update.bind(this));
		this.delete = asyncHandler(this.delete.bind(this));
		this.uploadProof = asyncHandler(this.uploadProof.bind(this));
	}

	async getAll(req, res) {
		const result = await this.deliveryService.getAll(req.query);

		res.status(200).json({
			status: "success",
			payload: result.items,
			pagination: result.pagination,
		});
	}

	async getById(req, res) {
		const delivery = await this.deliveryService.getById(req.params.id);

		res.status(200).json({
			status: "success",
			payload: delivery,
		});
	}

	async getTracking(req, res) {
		const tracking = await this.deliveryService.getTracking(req.params.id);

		res.status(200).json({
			status: "success",
			payload: tracking,
		});
	}

	async create(req, res) {
		const delivery = await this.deliveryService.create(req.body);

		res.status(201).json({
			status: "success",
			payload: delivery,
		});
	}

	async update(req, res) {
		const delivery = await this.deliveryService.update(
			req.params.id,
			req.body,
		);

		res.status(200).json({
			status: "success",
			payload: delivery,
		});
	}

	async delete(req, res) {
		const delivery = await this.deliveryService.delete(req.params.id);

		res.status(200).json({
			status: "success",
			payload: delivery,
		});
	}

	async uploadProof(req, res) {
		const delivery = await this.deliveryService.uploadProof(
			req.params.id,
			req.file,
		);

		res.status(200).json({
			status: "success",
			payload: delivery,
		});
	}
}
