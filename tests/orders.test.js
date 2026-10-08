import { expect } from "chai";
import request from "supertest";

import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/database.js";
import { UserModel } from "../src/models/user.model.js";
import { OrderModel } from "../src/models/order.model.js";

describe("Orders API", () => {
	before(async () => {
		await connectDB();
	});

	afterEach(async () => {
		await OrderModel.deleteMany({
			deliveryAddress: "123 Test Street",
		});

		await UserModel.deleteMany({
			email: /^test-orders-/,
		});
	});

	after(async () => {
		await disconnectDB();
	});

	const createTestUser = async () => {
		const response = await request(app)
			.post("/api/users")
			.send({
				name: "Usuario Test Orders",
				email: `test-orders-${Date.now()}-${Math.random()}@test.com`,
				password: "123456",
			});

		return response.body.data;
	};

	const createTestOrder = async () => {
		const user = await createTestUser();

		const response = await request(app).post("/api/orders").send({
			userId: user._id,
			deliveryAddress: "123 Test Street",
			total: 150,
		});

		return response.body.payload;
	};

	it("debería responder correctamente al obtener las órdenes", async () => {
		const response = await request(app).get("/api/orders");

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload).to.be.an("array");
	});

	it("debería responder ORDER_NOT_FOUND cuando la orden no existe", async () => {
		const response = await request(app).get(
			"/api/orders/507f1f77bcf86cd799439011",
		);

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("ORDER_NOT_FOUND");
		expect(response.body.message).to.equal(
			"No se encontró el pedido solicitado.",
		);
	});

	it("debería crear una orden correctamente", async () => {
		const user = await createTestUser();

		const response = await request(app).post("/api/orders").send({
			userId: user._id,
			deliveryAddress: "123 Test Street",
			total: 150,
		});

		expect(response.status).to.equal(201);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload).to.be.an("object");
		expect(response.body.payload.userId).to.exist;
		expect(response.body.payload.deliveryAddress).to.equal("123 Test Street");
		expect(response.body.payload.total).to.equal(150);
		expect(response.body.payload.status).to.equal("created");
		expect(response.body.payload.priority).to.equal("normal");
		expect(response.body.payload.isActive).to.equal(true);
	});

	it("debería obtener una orden correctamente por ID", async () => {
		const order = await createTestOrder();

		const response = await request(app).get(`/api/orders/${order._id}`);

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload).to.be.an("object");
		expect(response.body.payload._id).to.equal(order._id);
		expect(response.body.payload.deliveryAddress).to.equal("123 Test Street");
		expect(response.body.payload.total).to.equal(150);
	});

	it("debería actualizar una orden correctamente", async () => {
		const order = await createTestOrder();

		const response = await request(app).put(`/api/orders/${order._id}`).send({
			status: "assigned",
			priority: "high",
		});

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload).to.be.an("object");
		expect(response.body.payload.status).to.equal("assigned");
		expect(response.body.payload.priority).to.equal("high");
	});

	it("debería responder un error de validación cuando el estado de la orden es inválido", async () => {
		const order = await createTestOrder();

		const response = await request(app).put(`/api/orders/${order._id}`).send({
			status: "estado-invalido",
		});

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
		expect(response.body.message).to.equal(
			"Los datos enviados no son válidos.",
		);
	});

	it("debería responder un error de validación cuando faltan datos obligatorios", async () => {
		const user = await createTestUser();

		const response = await request(app).post("/api/orders").send({
			userId: user._id,
			total: 150,
		});

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
	});

	it("debería responder un error de validación cuando el userId es inválido", async () => {
		const response = await request(app).post("/api/orders").send({
			userId: "abc",
			deliveryAddress: "123 Test Street",
			total: 150,
		});

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
	});

	it("debería responder un error de validación cuando el total es negativo", async () => {
		const user = await createTestUser();

		const response = await request(app).post("/api/orders").send({
			userId: user._id,
			deliveryAddress: "123 Test Street",
			total: -50,
		});

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
	});
});
