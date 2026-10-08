import { expect } from "chai";
import request from "supertest";

import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/database.js";
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
		expect(response.body.data).to.be.an("array");
	});

	it("debería responder PRODUCT_NOT_FOUND cuando el producto no existe", async () => {
		const response = await request(app).get(
			"/api/products/507f1f77bcf86cd799439011",
		);

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("PRODUCT_NOT_FOUND");
	});

	it("debería responder un error de validación cuando el ID es inválido", async () => {
		const response = await request(app).get("/api/products/abc");

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
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
	});

	it("debería responder un error de validación cuando el stock es negativo", async () => {
		const response = await request(app).post("/api/products").send({
			name: "Producto Test",
			price: 100,
			stock: -10,
		});

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
	});

	it("debería actualizar el stock de un producto correctamente", async () => {
		const createResponse = await request(app).post("/api/products").send({
			name: "Producto Test",
			price: 100,
			stock: 10,
		});

		const productId = createResponse.body.data._id;

		const response = await request(app)
			.patch(`/api/products/${productId}/stock`)
			.send({
				stock: 25,
			});

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.data).to.be.an("object");
		expect(response.body.data.stock).to.equal(25);
	});

	it("debería responder un error de validación cuando se intenta establecer un stock negativo", async () => {
		const createResponse = await request(app).post("/api/products").send({
			name: "Producto Test",
			price: 100,
			stock: 10,
		});

		const productId = createResponse.body.data._id;

		const response = await request(app)
			.patch(`/api/products/${productId}/stock`)
			.send({
				stock: -5,
			});

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
	});

	it("debería responder PRODUCT_NOT_FOUND cuando se intenta actualizar un producto inexistente", async () => {
		const response = await request(app)
			.patch("/api/products/507f1f77bcf86cd799439011/stock")
			.send({
				stock: 25,
			});

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("PRODUCT_NOT_FOUND");
	});
});
