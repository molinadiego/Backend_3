import { expect } from "chai";
import request from "supertest";

import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/database.js";
import { DELIVERY_PRIORITY, ORDER_STATUS } from "../src/constants/index.js";
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
		expect(response.body.pagination.page).to.equal(1);
		expect(response.body.pagination.limit).to.equal(10);
		expect(response.body.pagination.totalPages).to.equal(
			Math.ceil(response.body.pagination.total / 10),
		);
	});

	it("debería combinar filtros de orden con paginación", async () => {
		const user = await createTestUser();
		const matchingOrders = await OrderModel.create(
			[1, 2, 3].map((index) => ({
				userId: user._id,
				deliveryAddress: "123 Test Street",
				total: 100 + index,
				status: ORDER_STATUS.CREATED,
				priority: DELIVERY_PRIORITY.HIGH,
			})),
		);
		await OrderModel.create([
			{
				userId: user._id,
				deliveryAddress: "123 Test Street",
				total: 200,
				status: ORDER_STATUS.CANCELLED,
				priority: DELIVERY_PRIORITY.HIGH,
			},
			{
				userId: user._id,
				deliveryAddress: "123 Test Street",
				total: 201,
				status: ORDER_STATUS.CREATED,
				priority: DELIVERY_PRIORITY.NORMAL,
			},
		]);

		const query = `status=${ORDER_STATUS.CREATED}&priority=${DELIVERY_PRIORITY.HIGH}&userId=${user._id}`;
		const pageOneResponse = await request(app).get(
			`/api/orders?${query}&page=1&limit=1`,
		);
		const pageTwoResponse = await request(app).get(
			`/api/orders?${query}&page=2&limit=1`,
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
		expect(pageTwoResponse.body.payload[0].status).to.equal(ORDER_STATUS.CREATED);
		expect(pageTwoResponse.body.payload[0].priority).to.equal(
			DELIVERY_PRIORITY.HIGH,
		);
		expect(pageOneResponse.body.payload[0]._id).to.not.equal(
			pageTwoResponse.body.payload[0]._id,
		);
		expect(
			matchingOrders.some(
				(order) =>
					order._id.toString() === pageTwoResponse.body.payload[0]._id,
			),
		).to.equal(true);
	});

	it("debería rechazar parámetros de paginación inválidos", async () => {
		const response = await request(app).get("/api/orders?page=texto");

		expect(response.status).to.equal(400);
		expect(response.body.error).to.equal("VALIDATION_ERROR");
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

	it("debería eliminar una orden correctamente", async () => {
		const order = await createTestOrder();

		const response = await request(app).delete(`/api/orders/${order._id}`);

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload).to.be.an("object");
		expect(response.body.payload._id).to.equal(order._id);
		expect(response.body.payload.isActive).to.equal(false);
		const storedOrder = await OrderModel.findById(order._id);
		expect(storedOrder.isActive).to.equal(false);
	});

	it("debería responder ORDER_NOT_FOUND al eliminar una orden inexistente", async () => {
		const response = await request(app).delete(
			"/api/orders/507f1f77bcf86cd799439011",
		);

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("ORDER_NOT_FOUND");
		expect(response.body.message).to.equal(
			"No se encontró el pedido solicitado.",
		);
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
