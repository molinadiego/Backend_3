import { expect } from "chai";
import path from "node:path";
import request from "supertest";
import { unlink } from "node:fs/promises";

import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/database.js";
import { USER_ROLES } from "../src/constants/index.js";
import { UserModel } from "../src/models/user.model.js";
import { OrderModel } from "../src/models/order.model.js";
import { DeliveryModel } from "../src/models/delivery.model.js";

describe("Uploads API", () => {
	const createdUserIds = [];
	const createdOrderIds = [];
	const createdDeliveryIds = [];

	before(async () => {
		await connectDB();
	});

	afterEach(async () => {
		const users = await UserModel.find({
			_id: { $in: createdUserIds },
		}).lean();

		const deliveries = await DeliveryModel.find({
			_id: { $in: createdDeliveryIds },
		}).lean();

		const filePaths = [
			...users.flatMap((user) =>
				(user.documents || []).map((document) => document.path),
			),
			...deliveries
				.filter((delivery) => delivery.proof?.path)
				.map((delivery) => delivery.proof.path),
		];

		for (const filePath of filePaths) {
			try {
				await unlink(filePath);
			} catch (error) {
				if (error.code !== "ENOENT") {
					throw error;
				}
			}
		}

		await DeliveryModel.deleteMany({
			_id: { $in: createdDeliveryIds },
		});

		await OrderModel.deleteMany({
			_id: { $in: createdOrderIds },
		});

		await UserModel.deleteMany({
			_id: { $in: createdUserIds },
		});

		createdUserIds.length = 0;
		createdOrderIds.length = 0;
		createdDeliveryIds.length = 0;
	});

	after(async () => {
		await disconnectDB();
	});

	const createTestUser = async (role = USER_ROLES.CUSTOMER) => {
		const user = await UserModel.create({
			name: "Usuario Upload Test",
			email: `test-uploads-${Date.now()}-${Math.random()}@test.com`,
			password: "test-password",
			role,
		});

		createdUserIds.push(user._id);

		return user;
	};

	const createTestDelivery = async () => {
		const customer = await createTestUser();
		const driver = await createTestUser(USER_ROLES.DRIVER);

		const order = await OrderModel.create({
			userId: customer._id,
			deliveryAddress: "Dirección de prueba 123",
			total: 100,
		});

		createdOrderIds.push(order._id);

		const delivery = await DeliveryModel.create({
			order: order._id,
			deliveryPerson: driver._id,
			address: "Dirección de prueba 123",
		});

		createdDeliveryIds.push(delivery._id);

		return delivery;
	};

	const pdfBuffer = Buffer.from(
		"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF",
	);

	it("debería cargar correctamente un documento de usuario", async () => {
		const user = await createTestUser();

		const response = await request(app)
			.post(`/api/users/${user._id}/documents`)
			.field("documentType", "user_document")
			.attach("file", pdfBuffer, {
				filename: "documento.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.data.documents).to.have.lengthOf(1);
		expect(response.body.data.password).to.not.exist;
		expect(response.body.data.documents[0].documentType).to.equal(
			"user_document",
		);
		expect(response.body.data.documents[0].mimetype).to.equal(
			"application/pdf",
		);
		expect(response.body.data.documents[0].path).to.not.exist;

		const storedUser = await UserModel.findById(user._id).lean();
		expect(path.isAbsolute(storedUser.documents[0].path)).to.equal(false);
		expect(storedUser.documents[0].path).to.match(/^uploads\/documents\//);

		const userResponse = await request(app).get(`/api/users/${user._id}`);
		expect(userResponse.body.data.documents[0].path).to.not.exist;

		const usersResponse = await request(app).get("/api/users");
		const listedUser = usersResponse.body.data.find(
			(item) => item._id === user._id.toString(),
		);
		expect(listedUser.documents[0].path).to.not.exist;
	});

	it("debería responder FILE_REQUIRED cuando falta el archivo", async () => {
		const user = await createTestUser();

		const response = await request(app)
			.post(`/api/users/${user._id}/documents`)
			.field("documentType", "user_document");

		expect(response.status).to.equal(400);
		expect(response.body.error).to.equal("FILE_REQUIRED");
	});

	it("debería responder INVALID_DOCUMENT_TYPE cuando el tipo es inválido", async () => {
		const user = await createTestUser();

		const response = await request(app)
			.post(`/api/users/${user._id}/documents`)
			.field("documentType", "documento_invalido")
			.attach("file", pdfBuffer, {
				filename: "documento.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).to.equal(400);
		expect(response.body.error).to.equal("INVALID_DOCUMENT_TYPE");
	});

	it("debería responder INVALID_FILE_TYPE cuando el formato no está permitido", async () => {
		const user = await createTestUser();

		const response = await request(app)
			.post(`/api/users/${user._id}/documents`)
			.field("documentType", "user_document")
			.attach("file", Buffer.from("archivo de prueba"), {
				filename: "documento.txt",
				contentType: "text/plain",
			});

		expect(response.status).to.equal(400);
		expect(response.body.error).to.equal("INVALID_FILE_TYPE");
	});

	it("debería responder FILE_TOO_LARGE cuando supera los 5 MB", async () => {
		const user = await createTestUser();
		const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1, 65);

		const response = await request(app)
			.post(`/api/users/${user._id}/documents`)
			.field("documentType", "user_document")
			.attach("file", largeBuffer, {
				filename: "documento.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).to.equal(400);
		expect(response.body.error).to.equal("FILE_TOO_LARGE");
	});

	it("debería cargar correctamente un comprobante de entrega", async () => {
		const delivery = await createTestDelivery();

		const response = await request(app)
			.post(`/api/deliveries/${delivery._id}/proof`)
			.attach("file", pdfBuffer, {
				filename: "comprobante.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).to.equal(200);
		expect(response.body.payload.proof.documentType).to.equal("delivery_proof");
		expect(response.body.payload.proof.mimetype).to.equal("application/pdf");
		expect(response.body.payload.proof.path).to.not.exist;

		const storedDelivery = await DeliveryModel.findById(delivery._id).lean();
		expect(path.isAbsolute(storedDelivery.proof.path)).to.equal(false);
		expect(storedDelivery.proof.path).to.match(/^uploads\/proofs\//);

		const deliveryResponse = await request(app).get(
			`/api/deliveries/${delivery._id}`,
		);
		expect(deliveryResponse.body.payload.proof.path).to.not.exist;

		const deliveriesResponse = await request(app).get("/api/deliveries");
		const listedDelivery = deliveriesResponse.body.payload.find(
			(item) => item._id === delivery._id.toString(),
		);
		expect(listedDelivery.proof.path).to.not.exist;
	});

	it("debería responder DELIVERY_NOT_FOUND cuando la entrega no existe", async () => {
		const response = await request(app)
			.post("/api/deliveries/507f1f77bcf86cd799439011/proof")
			.attach("file", pdfBuffer, {
				filename: "comprobante.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).to.equal(404);
		expect(response.body.error).to.equal("DELIVERY_NOT_FOUND");
	});

	it("debería aceptar archivos WebP", async () => {
		const user = await createTestUser();

		const response = await request(app)
			.post(`/api/users/${user._id}/documents`)
			.field("documentType", "user_document")
			.attach("file", Buffer.from("contenido de prueba"), {
				filename: "documento.webp",
				contentType: "image/webp",
			});

		expect(response.status).to.equal(200);
		expect(response.body.data.documents[0].mimetype).to.equal("image/webp");
	});

	it("debería almacenar la ruta de una licencia relativa y no exponerla", async () => {
		const driver = await createTestUser(USER_ROLES.DRIVER);

		const response = await request(app)
			.post(`/api/users/${driver._id}/documents`)
			.field("documentType", "driver_license")
			.attach("file", pdfBuffer, {
				filename: "licencia.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).to.equal(200);
		expect(response.body.data.documents[0].path).to.not.exist;

		const storedDriver = await UserModel.findById(driver._id).lean();
		expect(path.isAbsolute(storedDriver.documents[0].path)).to.equal(false);
		expect(storedDriver.documents[0].path).to.match(/^uploads\/licenses\//);
	});

	it("debería rechazar una licencia para un usuario que no sea repartidor", async () => {
		const user = await createTestUser(USER_ROLES.CUSTOMER);

		const response = await request(app)
			.post(`/api/users/${user._id}/documents`)
			.field("documentType", "driver_license")
			.attach("file", pdfBuffer, {
				filename: "licencia.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).to.equal(400);
		expect(response.body.error).to.equal("INVALID_DOCUMENT_TYPE");
	});

	it("debería responder USER_NOT_FOUND cuando el usuario no existe", async () => {
		const response = await request(app)
			.post("/api/users/507f1f77bcf86cd799439011/documents")
			.field("documentType", "user_document")
			.attach("file", pdfBuffer, {
				filename: "documento.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).to.equal(404);
		expect(response.body.error).to.equal("USER_NOT_FOUND");
	});
});
