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
		expect(response.body.pagination.page).to.equal(1);
		expect(response.body.pagination.limit).to.equal(10);
		expect(response.body.pagination.totalPages).to.equal(
			Math.ceil(response.body.pagination.total / 10),
		);
	});

	it("debería combinar el filtro por rol con la paginación", async () => {
		const initialAdminCount = await UserModel.countDocuments({
			role: USER_ROLES.ADMIN,
			isActive: true,
		});
		const createdUsers = await UserModel.create([
			{
				name: "Admin Test Uno",
				email: `test-users-pagination-${Date.now()}-1@test.com`,
				password: await bcrypt.hash("test-password", 10),
				role: USER_ROLES.ADMIN,
			},
			{
				name: "Admin Test Dos",
				email: `test-users-pagination-${Date.now()}-2@test.com`,
				password: await bcrypt.hash("test-password", 10),
				role: USER_ROLES.ADMIN,
			},
			{
				name: "Admin Test Tres",
				email: `test-users-pagination-${Date.now()}-3@test.com`,
				password: await bcrypt.hash("test-password", 10),
				role: USER_ROLES.ADMIN,
			},
			{
				name: "Cliente Test",
				email: `test-users-pagination-${Date.now()}-4@test.com`,
				password: await bcrypt.hash("test-password", 10),
				role: USER_ROLES.CUSTOMER,
			},
		]);

		const pageOneResponse = await request(app).get(
			"/api/users?role=admin&page=1&limit=1",
		);
		const pageTwoResponse = await request(app).get(
			"/api/users?role=admin&page=2&limit=1",
		);

		expect(pageOneResponse.status).to.equal(200);
		expect(pageOneResponse.body.data).to.have.lengthOf(1);
		expect(pageOneResponse.body.pagination).to.deep.equal({
			page: 1,
			limit: 1,
			total: initialAdminCount + 3,
			totalPages: initialAdminCount + 3,
		});
		expect(pageTwoResponse.status).to.equal(200);
		expect(pageTwoResponse.body.data).to.have.lengthOf(1);
		expect(pageTwoResponse.body.pagination.page).to.equal(2);
		expect(pageOneResponse.body.data[0].role).to.equal(USER_ROLES.ADMIN);
		expect(pageTwoResponse.body.data[0].role).to.equal(USER_ROLES.ADMIN);
		expect(pageOneResponse.body.data[0]._id).to.not.equal(
			pageTwoResponse.body.data[0]._id,
		);
		expect(
			createdUsers.some(
				(user) => user._id.toString() === pageTwoResponse.body.data[0]._id,
			),
		).to.equal(true);

		const cappedResponse = await request(app).get(
			"/api/users?role=admin&limit=101",
		);
		expect(cappedResponse.status).to.equal(200);
		expect(cappedResponse.body.pagination.limit).to.equal(100);
	});

	it("debería rechazar parámetros de paginación inválidos", async () => {
		for (const query of ["page=-1", "page=1.5", "page=texto", "limit=0"]) {
			const response = await request(app).get(`/api/users?${query}`);

			expect(response.status).to.equal(400);
			expect(response.body.error).to.equal("VALIDATION_ERROR");
		}
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
