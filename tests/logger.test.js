import { expect } from "chai";
import request from "supertest";

import app from "../src/app.js";

describe("Logger API", () => {
	it("debería generar los logs correctamente", async () => {
		const response = await request(app).get("/api/logger/loggertest");

		expect(response.status).to.equal(200);
		expect(response.body).to.be.an("object");
		expect(response.body.status).to.equal("success");
		expect(response.body.message).to.equal("logs generados correctamente");
	});
});
