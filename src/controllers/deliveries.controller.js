import { asyncHandler } from "../middlewares/async-handler.middleware.js";

export class DeliveryController {
	constructor(deliveryService) {
		this.deliveryService = deliveryService;

		this.getAll = asyncHandler(this.getAll.bind(this));
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
