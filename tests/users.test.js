import { expect } from "chai";
import request from "supertest";

import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/database.js";
import { UserModel } from "../src/models/user.model.js";

describe("Users API", () => {
	before(async () => {
		await connectDB();
	});

	afterEach(async () => {
		await UserModel.deleteMany({
			email: /^test-users-/,
		});
	});

	after(async () => {
		await disconnectDB();
	});

	const createTestUser = async () => {
		const response = await request(app)
			.post("/api/users")
			.send({
				name: "Usuario Test",
				email: `test-users-${Date.now()}-${Math.random()}@test.com`,
				password: "123456",
			});

		return response.body.data;
	};

	it("debería responder correctamente al obtener los usuarios", async () => {
		const response = await request(app).get("/api/users");

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.data).to.be.an("array");
	});

	it("debería responder USER_NOT_FOUND cuando el usuario no existe", async () => {
		const response = await request(app).get(
			"/api/users/507f1f77bcf86cd799439011",
		);

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("USER_NOT_FOUND");
	});

	it("debería responder un error de validación cuando el ID es inválido", async () => {
		const response = await request(app).get("/api/users/abc");

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
	});

	it("debería crear un usuario correctamente", async () => {
		const response = await request(app)
			.post("/api/users")
			.send({
				name: "Usuario Test",
				email: `test-users-${Date.now()}@test.com`,
				password: "123456",
			});

		expect(response.status).to.equal(201);
		expect(response.body.status).to.equal("success");
		expect(response.body.data).to.be.an("object");
		expect(response.body.data.name).to.equal("Usuario Test");
		expect(response.body.data.email).to.include("@test.com");
		expect(response.body.data.password).to.not.exist;
	});

	it("debería responder un error de validación cuando faltan datos obligatorios", async () => {
		const response = await request(app).post("/api/users").send({
			name: "Usuario Test",
		});

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
	});

	it("debería responder un error de validación cuando el email ya existe", async () => {
		const email = `test-users-${Date.now()}@test.com`;

		const firstResponse = await request(app).post("/api/users").send({
			name: "Usuario Test",
			email,
			password: "123456",
		});

		expect(firstResponse.status).to.equal(201);

		const response = await request(app).post("/api/users").send({
			name: "Otro Usuario",
			email,
			password: "654321",
		});

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
	});

	it("debería actualizar un usuario correctamente", async () => {
		const user = await createTestUser();

		const response = await request(app).put(`/api/users/${user._id}`).send({
			name: "Usuario Actualizado",
		});

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.data).to.be.an("object");
		expect(response.body.data.name).to.equal("Usuario Actualizado");
	});

	it("debería responder USER_NOT_FOUND cuando se intenta actualizar un usuario inexistente", async () => {
		const response = await request(app)
			.put("/api/users/507f1f77bcf86cd799439011")
			.send({
				name: "Usuario Actualizado",
			});

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("USER_NOT_FOUND");
	});

	it("debería eliminar un usuario correctamente", async () => {
		const user = await createTestUser();

		const response = await request(app).delete(`/api/users/${user._id}`);

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.message).to.equal("Usuario eliminado correctamente");
	});

	it("debería responder USER_NOT_FOUND cuando se intenta eliminar un usuario inexistente", async () => {
		const response = await request(app).delete(
			"/api/users/507f1f77bcf86cd799439011",
		);

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("USER_NOT_FOUND");
	});

	it("debería responder ROUTE_NOT_FOUND cuando la ruta no existe", async () => {
		const response = await request(app).get("/api/ruta-que-no-existe");

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("ROUTE_NOT_FOUND");
	});
});
