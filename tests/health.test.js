import { expect } from "chai";
import request from "supertest";

import app from "../src/app.js";
import { connectDB, disconnectDB } from "../src/config/database.js";

describe("Health API", () => {
	before(async () => {
		await connectDB();
	});

	after(async () => {
		await disconnectDB();
	});

	it("debería informar que la aplicación y MongoDB están disponibles", async () => {
		const response = await request(app).get("/health");

		expect(response.status).to.equal(200);
		expect(response.body.status).to.equal("ok");
		expect(response.body.environment).to.equal("test");
		expect(response.body.uptime).to.be.a("number").and.greaterThan(0);
		expect(Number.isNaN(Date.parse(response.body.timestamp))).to.equal(false);
	});
});
