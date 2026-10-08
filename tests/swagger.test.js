import { expect } from "chai";
import request from "supertest";

import app from "../src/app.js";

describe("Swagger API", () => {
	it("debería responder correctamente al acceder a la documentación", async () => {
		const response = await request(app).get("/api/docs/");

		expect(response.status).to.equal(200);
		expect(response.headers["content-type"]).to.match(/html/);
		expect(response.text).to.include("Swagger UI");
	});
});
