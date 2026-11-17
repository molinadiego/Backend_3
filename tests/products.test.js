import { expect } from "chai";
import request from "supertest";

import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/database.js";
import { PRODUCT_STATUS } from "../src/constants/index.js";
import { ProductModel } from "../src/models/product.model.js";

describe("Products API", () => {
	before(async () => {
		await connectDB();
	});

	afterEach(async () => {
		await ProductModel.deleteMany({
			name: "Producto Test",
		});
	});

	after(async () => {
		await disconnectDB();
	});

	it("debería responder correctamente al obtener los productos", async () => {
		const response = await request(app).get("/api/products");

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.payload).to.be.an("array");
		expect(response.body.pagination.page).to.equal(1);
		expect(response.body.pagination.limit).to.equal(10);
		expect(response.body.pagination.totalPages).to.equal(
			Math.ceil(response.body.pagination.total / 10),
		);
	});

	it("debería combinar el filtro por estado con paginación y limitar limit", async () => {
		const initialAvailableCount = await ProductModel.countDocuments({
			status: PRODUCT_STATUS.AVAILABLE,
			isActive: true,
		});
		const createdProducts = await ProductModel.create([
			{
				name: "Producto Test",
				price: 10,
				stock: 5,
				status: PRODUCT_STATUS.AVAILABLE,
			},
			{
				name: "Producto Test",
				price: 20,
				stock: 4,
				status: PRODUCT_STATUS.AVAILABLE,
			},
			{
				name: "Producto Test",
				price: 30,
				stock: 0,
				status: PRODUCT_STATUS.OUT_OF_STOCK,
			},
		]);

		const pageOneResponse = await request(app).get(
			"/api/products?status=AVAILABLE&page=1&limit=1",
		);
		const pageTwoResponse = await request(app).get(
			"/api/products?status=AVAILABLE&page=2&limit=1",
		);

		expect(pageOneResponse.status).to.equal(200);
		expect(pageOneResponse.body.pagination).to.deep.equal({
			page: 1,
			limit: 1,
			total: initialAvailableCount + 2,
			totalPages: initialAvailableCount + 2,
		});
		expect(pageTwoResponse.status).to.equal(200);
		expect(pageTwoResponse.body.pagination.page).to.equal(2);
		expect(pageTwoResponse.body.payload).to.have.lengthOf(1);
		expect(pageOneResponse.body.payload[0].status).to.equal(
			PRODUCT_STATUS.AVAILABLE,
		);
		expect(pageTwoResponse.body.payload[0].status).to.equal(
			PRODUCT_STATUS.AVAILABLE,
		);
		expect(pageOneResponse.body.payload[0]._id).to.not.equal(
			pageTwoResponse.body.payload[0]._id,
		);
		expect(
			createdProducts.some(
				(product) =>
					product._id.toString() === pageTwoResponse.body.payload[0]._id,
			),
		).to.equal(true);

		const cappedResponse = await request(app).get(
			"/api/products?status=AVAILABLE&limit=101",
		);
		expect(cappedResponse.status).to.equal(200);
		expect(cappedResponse.body.pagination.limit).to.equal(100);
	});

	it("debería rechazar parámetros de paginación inválidos", async () => {
		for (const query of ["page=0", "page=2.5", "page=texto", "limit=-1"]) {
			const response = await request(app).get(`/api/products?${query}`);

			expect(response.status).to.equal(400);
			expect(response.body.error).to.equal("VALIDATION_ERROR");
		}
	});

	it("debería responder PRODUCT_NOT_FOUND cuando el producto no existe", async () => {
		const response = await request(app).get(
			"/api/products/507f1f77bcf86cd799439011",
		);

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("PRODUCT_NOT_FOUND");
		expect(response.body.message).to.equal("No se encontró el producto.");
	});

	it("debería responder un error de validación cuando el ID es inválido", async () => {
		const response = await request(app).get("/api/products/abc");

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
		expect(response.body.message).to.equal("Los datos enviados no son válidos.");
	});

	it("debería crear un producto correctamente", async () => {
		const response = await request(app).post("/api/products").send({
			name: "Producto Test",
			price: 100,
			stock: 10,
		});

		expect(response.status).to.equal(201);
		expect(response.body.status).to.equal("success");
		expect(response.body.data).to.be.an("object");
		expect(response.body.data.name).to.equal("Producto Test");
		expect(response.body.data.price).to.equal(100);
		expect(response.body.data.stock).to.equal(10);
	});

	it("debería responder un error de validación cuando el precio es negativo", async () => {
		const response = await request(app).post("/api/products").send({
			name: "Producto Test",
			price: -100,
			stock: 10,
		});

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
		expect(response.body.message).to.equal("Los datos enviados no son válidos.");
	});

	it("debería responder un error de validación cuando el stock es negativo al crear un producto", async () => {
		const response = await request(app).post("/api/products").send({
			name: "Producto Test",
			price: 100,
			stock: -10,
		});

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
		expect(response.body.message).to.equal("Los datos enviados no son válidos.");
	});

	it("debería actualizar el stock de un producto", async () => {
		const createResponse = await request(app).post("/api/products").send({
			name: "Producto Test",
			price: 100,
			stock: 10,
		});

		const productId = createResponse.body.data._id;

		const response = await request(app)
			.patch(`/api/products/${productId}/stock`)
			.send({ stock: 25 });

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.data).to.be.an("object");
		expect(response.body.data.stock).to.equal(25);
	});

	it("debería validar correctamente el stock al actualizarlo", async () => {
		const createResponse = await request(app).post("/api/products").send({
			name: "Producto Test",
			price: 100,
			stock: 10,
		});

		const productId = createResponse.body.data._id;

		const response = await request(app)
			.patch(`/api/products/${productId}/stock`)
			.send({ stock: -5 });

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
		expect(response.body.message).to.equal("Los datos enviados no son válidos.");
	});

	it("debería responder PRODUCT_NOT_FOUND al actualizar un producto inexistente", async () => {
		const response = await request(app)
			.patch("/api/products/507f1f77bcf86cd799439011/stock")
			.send({ stock: 25 });

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("PRODUCT_NOT_FOUND");
		expect(response.body.message).to.equal("No se encontró el producto.");
	});

	it("debería actualizar los datos generales de un producto", async () => {
		const createResponse = await request(app).post("/api/products").send({
			name: "Producto Test",
			price: 100,
			stock: 10,
		});
		const response = await request(app)
			.put(`/api/products/${createResponse.body.data._id}`)
			.send({ name: "Producto Test actualizado", price: 125, stock: 0 });

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.data.name).to.equal("Producto Test actualizado");
		expect(response.body.data.price).to.equal(125);
		expect(response.body.data.stock).to.equal(0);
		expect(response.body.data.status).to.equal(PRODUCT_STATUS.OUT_OF_STOCK);
	});

	it("debería validar los datos generales y rechazar campos controlados del producto", async () => {
		const createResponse = await request(app).post("/api/products").send({
			name: "Producto Test",
			price: 100,
			stock: 10,
		});
		const id = createResponse.body.data._id;
		const invalidPrice = await request(app)
			.put(`/api/products/${id}`)
			.send({ price: -1 });
		const invalidName = await request(app)
			.put(`/api/products/${id}`)
			.send({ name: " " });
		const protectedStatus = await request(app)
			.put(`/api/products/${id}`)
			.send({ status: PRODUCT_STATUS.OUT_OF_STOCK });

		for (const response of [invalidPrice, invalidName, protectedStatus]) {
			expect(response.status).to.equal(400);
			expect(response.body.error).to.equal("VALIDATION_ERROR");
		}
	});

	it("debería eliminar lógicamente un producto y devolverlo como inexistente", async () => {
		const createResponse = await request(app).post("/api/products").send({
			name: "Producto Test",
			price: 100,
			stock: 10,
		});
		const id = createResponse.body.data._id;
		const response = await request(app).delete(`/api/products/${id}`);

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.data.isActive).to.equal(false);
		expect((await ProductModel.findById(id)).isActive).to.equal(false);

		const getResponse = await request(app).get(`/api/products/${id}`);
		expect(getResponse.status).to.equal(404);
		expect(getResponse.body.error).to.equal("PRODUCT_NOT_FOUND");
	});

	it("debería responder PRODUCT_NOT_FOUND al actualizar o eliminar un producto inexistente", async () => {
		const id = "507f1f77bcf86cd799439011";
		const updateResponse = await request(app)
			.put(`/api/products/${id}`)
			.send({ name: "Producto Test actualizado" });
		const deleteResponse = await request(app).delete(`/api/products/${id}`);

		expect(updateResponse.status).to.equal(404);
		expect(updateResponse.body.error).to.equal("PRODUCT_NOT_FOUND");
		expect(deleteResponse.status).to.equal(404);
		expect(deleteResponse.body.error).to.equal("PRODUCT_NOT_FOUND");
	});
});
