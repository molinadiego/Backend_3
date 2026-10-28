import { expect } from "chai";
import request from "supertest";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/database.js";
import { USER_ROLES } from "../src/constants/index.js";
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
		const user = await createTestUser();
		const response = await request(app).get("/api/users");

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.data).to.be.an("array");
		const listedUser = response.body.data.find(
			(item) => item._id === user._id,
		);
		expect(listedUser).to.exist;
		expect(listedUser.password).to.not.exist;
	});

	it("no debería incluir la contraseña al consultar un usuario", async () => {
		const user = await createTestUser();
		const response = await request(app).get(`/api/users/${user._id}`);

		expect(response.status).to.equal(200);
		expect(response.body.data.password).to.not.exist;
	});

	it("debería responder USER_NOT_FOUND cuando el usuario no existe", async () => {
		const response = await request(app).get(
			"/api/users/507f1f77bcf86cd799439011",
		);

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("USER_NOT_FOUND");
		expect(response.body.message).to.equal(
			"No se encontró el usuario solicitado.",
		);
	});

	it("debería responder un error de validación cuando el ID es inválido", async () => {
		const response = await request(app).get("/api/users/abc");

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
		expect(response.body.message).to.equal("Los datos enviados no son válidos.");
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
		const storedUser = await UserModel.findOne({
			email: response.body.data.email,
		}).select("+password");
		expect(storedUser.password).to.not.equal("123456");
		expect(await bcrypt.compare("123456", storedUser.password)).to.equal(true);
		expect(response.body.data.role).to.equal(USER_ROLES.CUSTOMER);
	});

	for (const requestedRole of ["admin", "driver"]) {
		it(`no debería permitir registrarse con el rol ${requestedRole}`, async () => {
			const response = await request(app)
				.post("/api/users")
				.send({
					name: "Usuario Test",
					email: `test-users-${Date.now()}-${Math.random()}@test.com`,
					password: "123456",
					role: requestedRole,
				});

			expect(response.status).to.equal(201);
			const storedUser = await UserModel.findById(response.body.data._id);
			expect(storedUser.role).to.equal(USER_ROLES.CUSTOMER);
		});
	}

	it("debería responder un error de validación cuando faltan datos obligatorios", async () => {
		const response = await request(app).post("/api/users").send({
			name: "Usuario Test",
		});

		expect(response.status).to.equal(400);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("VALIDATION_ERROR");
		expect(response.body.message).to.equal("Los datos enviados no son válidos.");
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
		expect(response.body.message).to.equal("Los datos enviados no son válidos.");
	});

	it("debería actualizar un usuario correctamente", async () => {
		const user = await createTestUser();

		const response = await request(app).put(`/api/users/${user._id}`).send({
			name: "Usuario Actualizado",
			isActive: false,
			arbitraryField: "no debería persistirse",
		});

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.data).to.be.an("object");
		expect(response.body.data.name).to.equal("Usuario Actualizado");
		expect(response.body.data.password).to.not.exist;
		const storedUser = await UserModel.findById(user._id).select("+password");
		expect(await bcrypt.compare("123456", storedUser.password)).to.equal(true);
		expect(storedUser.isActive).to.equal(true);
		expect(storedUser.get("arbitraryField")).to.be.undefined;
	});

	it("debería hashear una contraseña cambiada sin exponerla", async () => {
		const user = await createTestUser();

		const response = await request(app).put(`/api/users/${user._id}`).send({
			password: "nueva-clave",
		});

		expect(response.status).to.equal(200);
		expect(response.body.data.password).to.not.exist;
		const storedUser = await UserModel.findById(user._id).select("+password");
		expect(storedUser.password).to.not.equal("nueva-clave");
		expect(await bcrypt.compare("nueva-clave", storedUser.password)).to.equal(
			true,
		);
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
		expect(response.body.message).to.equal(
			"No se encontró el usuario solicitado.",
		);
	});

	it("debería eliminar un usuario correctamente", async () => {
		const user = await createTestUser();

		const response = await request(app).delete(`/api/users/${user._id}`);

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("success");
		expect(response.body.message).to.equal("Usuario eliminado correctamente.");
	});

	it("debería responder USER_NOT_FOUND cuando se intenta eliminar un usuario inexistente", async () => {
		const response = await request(app).delete(
			"/api/users/507f1f77bcf86cd799439011",
		);

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("USER_NOT_FOUND");
		expect(response.body.message).to.equal(
			"No se encontró el usuario solicitado.",
		);
	});

	it("debería responder ROUTE_NOT_FOUND cuando la ruta no existe", async () => {
		const response = await request(app).get("/api/ruta-que-no-existe");

		expect(response.status).to.equal(404);
		expect(response.body.status).to.equal("error");
		expect(response.body.error).to.equal("ROUTE_NOT_FOUND");
		expect(response.body.message).to.equal("La ruta solicitada no existe.");
	});
});
