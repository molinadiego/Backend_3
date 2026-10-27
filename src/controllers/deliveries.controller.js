import { asyncHandler } from "../middlewares/async-handler.middleware.js";

export class DeliveryController {
	constructor(deliveryService) {
		this.deliveryService = deliveryService;

		this.uploadProof = asyncHandler(this.uploadProof.bind(this));
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
