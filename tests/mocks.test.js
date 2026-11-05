import { expect } from "chai";
import request from "supertest";

import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/database.js";
import { UserModel } from "../src/models/user.model.js";
import { OrderModel } from "../src/models/order.model.js";
import { DeliveryModel } from "../src/models/delivery.model.js";

describe("Mocks API", () => {
	let existingIds;

	before(async () => {
		await connectDB();
	});

	beforeEach(async () => {
		existingIds = {
			users: new Set((await UserModel.distinct("_id")).map(String)),
			orders: new Set((await OrderModel.distinct("_id")).map(String)),
			deliveries: new Set((await DeliveryModel.distinct("_id")).map(String)),
		};
	});

	afterEach(async () => {
		const removeNewRecords = async (model, originalIds) => {
			const currentIds = await model.distinct("_id");
			const createdIds = currentIds.filter(
				(id) => !originalIds.has(id.toString()),
			);

			if (createdIds.length > 0) {
				await model.deleteMany({ _id: { $in: createdIds } });
			}
		};

		await removeNewRecords(DeliveryModel, existingIds.deliveries);
		await removeNewRecords(OrderModel, existingIds.orders);
		await removeNewRecords(UserModel, existingIds.users);
	});

	after(async () => {
		await disconnectDB();
	});

	it("debería generar usuarios correctamente", async () => {
		const response = await request(app).get("/api/mocks/users?qty=2");

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload).to.be.an("array");
		expect(response.body.payload).to.have.lengthOf(2);
		expect(
			response.body.payload.every((user) => !Object.hasOwn(user, "password")),
		).to.equal(true);
	});

	it("debería generar repartidores correctamente", async () => {
		const response = await request(app).get(
			"/api/mocks/delivery-persons?qty=2",
		);

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload).to.be.an("array");
		expect(response.body.payload).to.have.lengthOf(2);
		expect(
			response.body.payload.every((user) => !Object.hasOwn(user, "password")),
		).to.equal(true);
	});

	it("debería generar órdenes correctamente", async () => {
		const response = await request(app).get("/api/mocks/orders?qty=2");

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload).to.be.an("array");
		expect(response.body.payload).to.have.lengthOf(2);
	});

	it("debería generar entregas correctamente", async () => {
		const response = await request(app).get("/api/mocks/deliveries?qty=2");

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload).to.be.an("array");
		expect(response.body.payload).to.have.lengthOf(2);
	});

	it("debería responder INVALID_MOCK_AMOUNT cuando qty es 0", async () => {
		const response = await request(app).get("/api/mocks/users?qty=0");

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
	});

	it("debería responder INVALID_MOCK_AMOUNT cuando qty es negativo", async () => {
		const response = await request(app).get("/api/mocks/users?qty=-1");

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
	});

	it("debería responder INVALID_MOCK_AMOUNT cuando qty supera el máximo permitido", async () => {
		const response = await request(app).get("/api/mocks/users?qty=51");

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
	});

	it("debería responder INVALID_MOCK_AMOUNT cuando qty es excesivamente alto", async () => {
		const response = await request(app).get("/api/mocks/users?qty=99999");

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
	});

	it("debería responder INVALID_MOCK_AMOUNT cuando qty no es numérico", async () => {
		const response = await request(app).get("/api/mocks/users?qty=abc");

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
	});

	it("debería responder INVALID_MOCK_AMOUNT cuando qty es decimal", async () => {
		const response = await request(app).get("/api/mocks/users?qty=2.5");

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
	});

	it("debería ejecutar el seed correctamente", async () => {
		const response = await request(app).post(
			"/api/mocks/seed?users=2&deliveryPersons=1&orders=2&deliveries=1",
		);

		expect(response.status).to.equal(201);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload).to.be.an("object");

		expect(response.body.payload.usersInserted).to.equal(2);
		expect(response.body.payload.deliveryPersonsInserted).to.equal(1);
		expect(response.body.payload.ordersInserted).to.equal(2);
		expect(response.body.payload.deliveriesInserted).to.equal(1);
	});

	it("debería responder INVALID_MOCK_AMOUNT cuando se solicitan órdenes sin usuarios", async () => {
		const response = await request(app).post(
			"/api/mocks/seed?users=0&deliveryPersons=1&orders=2&deliveries=0",
		);

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
	});

	it("debería responder INVALID_MOCK_AMOUNT cuando se solicitan entregas sin órdenes", async () => {
		const response = await request(app).post(
			"/api/mocks/seed?users=1&deliveryPersons=1&orders=0&deliveries=2",
		);

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
	});

	it("debería responder INVALID_MOCK_AMOUNT cuando se solicitan entregas sin repartidores", async () => {
		const response = await request(app).post(
			"/api/mocks/seed?users=1&deliveryPersons=0&orders=1&deliveries=2",
		);

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
	});
});
