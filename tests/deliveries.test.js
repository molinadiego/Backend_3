import { expect } from "chai";
import mongoose from "mongoose";
import request from "supertest";

import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/database.js";
import { DELIVERY_STATUS, USER_ROLES } from "../src/constants/index.js";
import { DeliveryModel } from "../src/models/delivery.model.js";
import { OrderModel } from "../src/models/order.model.js";
import { UserModel } from "../src/models/user.model.js";

describe("Deliveries API pagination", () => {
	const createdDeliveryIds = [];
	const createdOrderIds = [];
	const createdUserIds = [];

	before(async () => {
		await connectDB();
	});

	afterEach(async () => {
		await DeliveryModel.deleteMany({
			_id: { $in: createdDeliveryIds },
		});
		await OrderModel.deleteMany({
			_id: { $in: createdOrderIds },
		});
		await UserModel.deleteMany({
			_id: { $in: createdUserIds },
		});
		createdDeliveryIds.length = 0;
		createdOrderIds.length = 0;
		createdUserIds.length = 0;
	});

	after(async () => {
		await disconnectDB();
	});

	const createReferences = async ({ driverRole = USER_ROLES.DRIVER } = {}) => {
		const customer = await UserModel.create({
			name: "Cliente de prueba Delivery",
			email: `test-delivery-customer-${Date.now()}-${Math.random()}@test.com`,
			password: "test-password",
			role: USER_ROLES.CUSTOMER,
		});
		const deliveryPerson = await UserModel.create({
			name: "Repartidor de prueba Delivery",
			email: `test-delivery-driver-${Date.now()}-${Math.random()}@test.com`,
			password: "test-password",
			role: driverRole,
		});
		const order = await OrderModel.create({
			userId: customer._id,
			deliveryAddress: "Dirección de prueba 123",
			total: 100,
		});

		createdUserIds.push(customer._id, deliveryPerson._id);
		createdOrderIds.push(order._id);

		return { customer, deliveryPerson, order };
	};

	const createDeliveryThroughApi = async (references) => {
		const response = await request(app).post("/api/deliveries").send({
			order: references.order._id.toString(),
			deliveryPerson: references.deliveryPerson._id.toString(),
			address: "Dirección de prueba 123",
		});

		if (response.body.payload?._id) {
			createdDeliveryIds.push(response.body.payload._id);
		}

		return response;
	};

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

	it("debería crear una entrega con referencias activas y un repartidor válido", async () => {
		const references = await createReferences();
		const response = await createDeliveryThroughApi(references);

		expect(response.status).to.equal(201);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload.order).to.equal(references.order._id.toString());
		expect(response.body.payload.deliveryPerson).to.equal(
			references.deliveryPerson._id.toString(),
		);
		expect(response.body.payload.address).to.equal("Dirección de prueba 123");
		expect(response.body.payload.status).to.equal(DELIVERY_STATUS.PENDING);
		expect(response.body.payload.isActive).to.equal(true);
		expect(response.body.payload.proof).to.equal(null);
	});

	it("debería consultar una entrega por ID con referencias pobladas", async () => {
		const references = await createReferences();
		const created = await createDeliveryThroughApi(references);
		const response = await request(app).get(
			`/api/deliveries/${created.body.payload._id}`,
		);

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload._id).to.equal(created.body.payload._id);
		expect(response.body.payload.order._id).to.equal(
			references.order._id.toString(),
		);
		expect(response.body.payload.deliveryPerson._id).to.equal(
			references.deliveryPerson._id.toString(),
		);
	});

	it("debería devolver el seguimiento actual con los datos relacionados", async () => {
		const references = await createReferences();
		const created = await createDeliveryThroughApi(references);
		const estimatedDeliveryDate = "2030-10-10T18:00:00.000Z";
		await request(app)
			.put(`/api/deliveries/${created.body.payload._id}`)
			.send({
				status: DELIVERY_STATUS.IN_TRANSIT,
				estimatedDeliveryDate,
			});

		const response = await request(app).get(
			`/api/deliveries/${created.body.payload._id}/tracking`,
		);
		const tracking = response.body.payload;

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(tracking.deliveryId).to.equal(created.body.payload._id);
		expect(tracking.order).to.deep.include({
			id: references.order._id.toString(),
			deliveryAddress: "Dirección de prueba 123",
			total: 100,
			status: "created",
			priority: "normal",
		});
		expect(tracking.status).to.equal(DELIVERY_STATUS.IN_TRANSIT);
		expect(tracking.deliveryPerson).to.deep.include({
			id: references.deliveryPerson._id.toString(),
			name: "Repartidor de prueba Delivery",
			role: USER_ROLES.DRIVER,
		});
		expect(tracking.deliveryPerson.email).to.equal(
			references.deliveryPerson.email,
		);
		expect(tracking.address).to.equal("Dirección de prueba 123");
		expect(new Date(tracking.estimatedDeliveryDate).toISOString()).to.equal(
			estimatedDeliveryDate,
		);
		expect(Number.isNaN(Date.parse(tracking.updatedAt))).to.equal(false);
	});

	it("debería responder DELIVERY_NOT_FOUND si no existe la entrega a seguir", async () => {
		const response = await request(app).get(
			`/api/deliveries/${new mongoose.Types.ObjectId()}/tracking`,
		);

		expect(response.status).to.equal(404);
		expect(response.body.error).to.equal("DELIVERY_NOT_FOUND");
	});

	it("debería responder VALIDATION_ERROR ante un ID inválido de tracking", async () => {
		const response = await request(app).get(
			"/api/deliveries/invalid/tracking",
		);

		expect(response.status).to.equal(400);
		expect(response.body.error).to.equal("VALIDATION_ERROR");
	});

	it("no debería devolver tracking para una entrega eliminada lógicamente", async () => {
		const references = await createReferences();
		const created = await createDeliveryThroughApi(references);
		const id = created.body.payload._id;
		const deleted = await request(app).delete(`/api/deliveries/${id}`);
		const response = await request(app).get(
			`/api/deliveries/${id}/tracking`,
		);

		expect(deleted.status).to.equal(200);
		expect(response.status).to.equal(404);
		expect(response.body.error).to.equal("DELIVERY_NOT_FOUND");
	});

	it("debería actualizar los campos logísticos permitidos", async () => {
		const references = await createReferences();
		const created = await createDeliveryThroughApi(references);
		const estimatedDeliveryDate = "2030-10-10T18:00:00.000Z";
		const response = await request(app)
			.put(`/api/deliveries/${created.body.payload._id}`)
			.send({
				address: "Nueva dirección de prueba 456",
				status: DELIVERY_STATUS.ASSIGNED,
				estimatedDeliveryDate,
			});

		expect(response.status).to.equal(200);
		expect(response.body.payload.address).to.equal(
			"Nueva dirección de prueba 456",
		);
		expect(response.body.payload.status).to.equal(DELIVERY_STATUS.ASSIGNED);
		expect(
			new Date(response.body.payload.estimatedDeliveryDate).toISOString(),
		).to.equal(estimatedDeliveryDate);
	});

	it("no debería permitir modificar isActive ni proof mediante el CRUD", async () => {
		const references = await createReferences();
		const created = await createDeliveryThroughApi(references);
		const id = created.body.payload._id;

		for (const protectedField of ["isActive", "proof"]) {
			const createResponse = await request(app)
				.post("/api/deliveries")
				.send({
					order: references.order._id.toString(),
					deliveryPerson: references.deliveryPerson._id.toString(),
					address: "Dirección de prueba 123",
					[protectedField]: protectedField === "isActive" ? false : {},
				});
			const response = await request(app)
				.put(`/api/deliveries/${id}`)
				.send({ [protectedField]: protectedField === "isActive" ? false : {} });

			expect(createResponse.status).to.equal(400);
			expect(createResponse.body.error).to.equal("VALIDATION_ERROR");
			expect(response.status).to.equal(400);
			expect(response.body.error).to.equal("VALIDATION_ERROR");
		}

		const storedDelivery = await DeliveryModel.findById(id);
		expect(storedDelivery.isActive).to.equal(true);
		expect(storedDelivery.proof).to.equal(null);
	});

	it("debería desactivar una entrega lógicamente y excluirla de consultas", async () => {
		const references = await createReferences();
		const created = await createDeliveryThroughApi(references);
		const id = created.body.payload._id;
		const response = await request(app).delete(`/api/deliveries/${id}`);

		expect(response.status).to.equal(200);
		expect(response.body.payload.isActive).to.equal(false);
		expect((await DeliveryModel.findById(id)).isActive).to.equal(false);

		const getResponse = await request(app).get(`/api/deliveries/${id}`);
		expect(getResponse.status).to.equal(404);
		expect(getResponse.body.error).to.equal("DELIVERY_NOT_FOUND");
	});

	it("debería validar campos requeridos, estado y fecha al crear", async () => {
		const references = await createReferences();
		const basePayload = {
			order: references.order._id.toString(),
			deliveryPerson: references.deliveryPerson._id.toString(),
			address: "Dirección de prueba 123",
		};
		const missingFields = await Promise.all(
			["order", "deliveryPerson", "address"].map((field) => {
				const payload = { ...basePayload };
				delete payload[field];
				return request(app).post("/api/deliveries").send(payload);
			}),
		);
		const invalidStatus = await request(app)
			.post("/api/deliveries")
			.send({ ...basePayload, status: "on_the_way" });
		const invalidDate = await request(app)
			.post("/api/deliveries")
			.send({ ...basePayload, estimatedDeliveryDate: "not-a-date" });

		for (const response of missingFields) {
			expect(response.status).to.equal(400);
			expect(response.body.error).to.equal("VALIDATION_ERROR");
		}
		expect(invalidStatus.status).to.equal(400);
		expect(invalidStatus.body.error).to.equal("INVALID_DELIVERY_STATUS");
		expect(invalidDate.status).to.equal(400);
		expect(invalidDate.body.error).to.equal("VALIDATION_ERROR");
	});

	it("debería rechazar IDs de Order inválidos o inexistentes al crear", async () => {
		const references = await createReferences();
		const invalidId = await request(app)
			.post("/api/deliveries")
			.send({
				order: "invalid",
				deliveryPerson: references.deliveryPerson._id.toString(),
				address: "Dirección de prueba 123",
			});
		const missingOrder = await request(app)
			.post("/api/deliveries")
			.send({
				order: new mongoose.Types.ObjectId().toString(),
				deliveryPerson: references.deliveryPerson._id.toString(),
				address: "Dirección de prueba 123",
			});

		expect(invalidId.status).to.equal(400);
		expect(invalidId.body.error).to.equal("VALIDATION_ERROR");
		expect(missingOrder.status).to.equal(404);
		expect(missingOrder.body.error).to.equal("ORDER_NOT_FOUND");
	});

	it("debería rechazar pedidos inactivos y usuarios que no sean repartidores", async () => {
		const references = await createReferences({ driverRole: USER_ROLES.CUSTOMER });
		const invalidDriver = await createDeliveryThroughApi(references);

		await OrderModel.findByIdAndUpdate(references.order._id, {
			isActive: false,
		});
		const inactiveOrder = await request(app)
			.post("/api/deliveries")
			.send({
				order: references.order._id.toString(),
				deliveryPerson: references.deliveryPerson._id.toString(),
				address: "Dirección de prueba 123",
			});

		expect(invalidDriver.status).to.equal(400);
		expect(invalidDriver.body.error).to.equal("VALIDATION_ERROR");
		expect(inactiveOrder.status).to.equal(404);
		expect(inactiveOrder.body.error).to.equal("ORDER_NOT_FOUND");
	});

	it("debería rechazar repartidores inexistentes, inactivos o con ID inválido", async () => {
		const references = await createReferences();
		const invalidId = await request(app)
			.post("/api/deliveries")
			.send({
				order: references.order._id.toString(),
				deliveryPerson: "invalid",
				address: "Dirección de prueba 123",
			});
		const missingDriver = await request(app)
			.post("/api/deliveries")
			.send({
				order: references.order._id.toString(),
				deliveryPerson: new mongoose.Types.ObjectId().toString(),
				address: "Dirección de prueba 123",
			});

		await UserModel.findByIdAndUpdate(references.deliveryPerson._id, {
			isActive: false,
		});
		const inactiveDriver = await request(app)
			.post("/api/deliveries")
			.send({
				order: references.order._id.toString(),
				deliveryPerson: references.deliveryPerson._id.toString(),
				address: "Dirección de prueba 123",
			});

		expect(invalidId.status).to.equal(400);
		expect(invalidId.body.error).to.equal("VALIDATION_ERROR");
		expect(missingDriver.status).to.equal(404);
		expect(missingDriver.body.error).to.equal("USER_NOT_FOUND");
		expect(inactiveDriver.status).to.equal(404);
		expect(inactiveDriver.body.error).to.equal("USER_NOT_FOUND");
	});

	it("debería responder errores al consultar una entrega inválida o inexistente", async () => {
		const invalidId = await request(app).get("/api/deliveries/invalid");
		const invalidUpdateId = await request(app)
			.put("/api/deliveries/invalid")
			.send({ status: DELIVERY_STATUS.ASSIGNED });
		const invalidDeleteId = await request(app).delete(
			"/api/deliveries/invalid",
		);
		const missingDelivery = await request(app).get(
			`/api/deliveries/${new mongoose.Types.ObjectId()}`,
		);

		expect(invalidId.status).to.equal(400);
		expect(invalidId.body.error).to.equal("VALIDATION_ERROR");
		expect(invalidUpdateId.status).to.equal(400);
		expect(invalidUpdateId.body.error).to.equal("VALIDATION_ERROR");
		expect(invalidDeleteId.status).to.equal(400);
		expect(invalidDeleteId.body.error).to.equal("VALIDATION_ERROR");
		expect(missingDelivery.status).to.equal(404);
		expect(missingDelivery.body.error).to.equal("DELIVERY_NOT_FOUND");
	});

	it("debería validar estado, fecha y referencias al actualizar", async () => {
		const references = await createReferences();
		const created = await createDeliveryThroughApi(references);
		const id = created.body.payload._id;
		const invalidStatus = await request(app)
			.put(`/api/deliveries/${id}`)
			.send({ status: "on_the_way" });
		const invalidDate = await request(app)
			.put(`/api/deliveries/${id}`)
			.send({ estimatedDeliveryDate: "not-a-date" });
		const missingOrder = await request(app)
			.put(`/api/deliveries/${id}`)
			.send({ order: new mongoose.Types.ObjectId().toString() });
		const invalidDriver = await request(app)
			.put(`/api/deliveries/${id}`)
			.send({ deliveryPerson: references.customer._id.toString() });

		expect(invalidStatus.status).to.equal(400);
		expect(invalidStatus.body.error).to.equal("INVALID_DELIVERY_STATUS");
		expect(invalidDate.status).to.equal(400);
		expect(invalidDate.body.error).to.equal("VALIDATION_ERROR");
		expect(missingOrder.status).to.equal(404);
		expect(missingOrder.body.error).to.equal("ORDER_NOT_FOUND");
		expect(invalidDriver.status).to.equal(400);
		expect(invalidDriver.body.error).to.equal("VALIDATION_ERROR");
	});

	it("debería responder DELIVERY_NOT_FOUND al actualizar o eliminar una entrega inexistente", async () => {
		const id = new mongoose.Types.ObjectId().toString();
		const updateResponse = await request(app)
			.put(`/api/deliveries/${id}`)
			.send({ status: DELIVERY_STATUS.ASSIGNED });
		const deleteResponse = await request(app).delete(`/api/deliveries/${id}`);

		expect(updateResponse.status).to.equal(404);
		expect(updateResponse.body.error).to.equal("DELIVERY_NOT_FOUND");
		expect(deleteResponse.status).to.equal(404);
		expect(deleteResponse.body.error).to.equal("DELIVERY_NOT_FOUND");
	});
});
