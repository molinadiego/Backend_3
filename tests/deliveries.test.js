import { expect } from "chai";
import mongoose from "mongoose";
import request from "supertest";

import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/database.js";
import { DELIVERY_STATUS } from "../src/constants/index.js";
import { DeliveryModel } from "../src/models/delivery.model.js";

describe("Deliveries API pagination", () => {
	const createdDeliveryIds = [];

	before(async () => {
		await connectDB();
	});

	afterEach(async () => {
		await DeliveryModel.deleteMany({
			_id: { $in: createdDeliveryIds },
		});
		createdDeliveryIds.length = 0;
	});

	after(async () => {
		await disconnectDB();
	});

	it("debería devolver metadata por defecto al listar entregas", async () => {
		const response = await request(app).get("/api/deliveries");

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload).to.be.an("array");
		expect(response.body.pagination.page).to.equal(1);
		expect(response.body.pagination.limit).to.equal(10);
		expect(response.body.pagination.totalPages).to.equal(
			Math.ceil(response.body.pagination.total / 10),
		);
	});

	it("debería combinar filtros de entrega con paginación", async () => {
		const orderId = new mongoose.Types.ObjectId();
		const deliveryPersonId = new mongoose.Types.ObjectId();
		const otherOrderId = new mongoose.Types.ObjectId();
		const otherDeliveryPersonId = new mongoose.Types.ObjectId();
		const matchingDeliveries = await DeliveryModel.create(
			[1, 2, 3].map(() => ({
				order: orderId,
				deliveryPerson: deliveryPersonId,
				address: "Dirección de prueba 123",
				status: DELIVERY_STATUS.PENDING,
			})),
		);
		createdDeliveryIds.push(
			...matchingDeliveries.map((delivery) => delivery._id),
		);
		const nonMatchingDeliveries = await DeliveryModel.create([
			{
				order: orderId,
				deliveryPerson: otherDeliveryPersonId,
				address: "Dirección de prueba 123",
				status: DELIVERY_STATUS.PENDING,
			},
			{
				order: otherOrderId,
				deliveryPerson: deliveryPersonId,
				address: "Dirección de prueba 123",
				status: DELIVERY_STATUS.PENDING,
			},
			{
				order: orderId,
				deliveryPerson: deliveryPersonId,
				address: "Dirección de prueba 123",
				status: DELIVERY_STATUS.CANCELLED,
			},
		]);
		createdDeliveryIds.push(
			...nonMatchingDeliveries.map((delivery) => delivery._id),
		);

		const filters = `status=${DELIVERY_STATUS.PENDING}&deliveryPerson=${deliveryPersonId}&order=${orderId}`;
		const pageOneResponse = await request(app).get(
			`/api/deliveries?${filters}&page=1&limit=1`,
		);
		const pageTwoResponse = await request(app).get(
			`/api/deliveries?${filters}&page=2&limit=1`,
		);

		expect(pageOneResponse.status).to.equal(200);
		expect(pageOneResponse.body.pagination).to.deep.equal({
			page: 1,
			limit: 1,
			total: 3,
			totalPages: 3,
		});
		expect(pageTwoResponse.status).to.equal(200);
		expect(pageTwoResponse.body.pagination.page).to.equal(2);
		expect(pageTwoResponse.body.payload).to.have.lengthOf(1);
		expect(pageTwoResponse.body.payload[0].status).to.equal(
			DELIVERY_STATUS.PENDING,
		);
		expect(pageOneResponse.body.payload[0]._id).to.not.equal(
			pageTwoResponse.body.payload[0]._id,
		);
		expect(
			matchingDeliveries.some(
				(delivery) =>
					delivery._id.toString() === pageTwoResponse.body.payload[0]._id,
			),
		).to.equal(true);
	});

	it("debería rechazar un identificador de filtro inválido", async () => {
		const filterResponse = await request(app).get(
			"/api/deliveries?deliveryPerson=invalid",
		);
		const paginationResponse = await request(app).get(
			"/api/deliveries?page=0",
		);

		expect(filterResponse.status).to.equal(400);
		expect(filterResponse.body.error).to.equal("VALIDATION_ERROR");
		expect(paginationResponse.status).to.equal(400);
		expect(paginationResponse.body.error).to.equal("VALIDATION_ERROR");
	});
});
