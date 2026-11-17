import { expect } from "chai";
import { spawnSync } from "node:child_process";

describe("Internal endpoints in production", () => {
	it("should return route not found without running seed or logger test", () => {
		const productionProbe = `
import request from "supertest";
import app from "./src/app.js";
import logger from "./src/utils/logger.js";

const seed = await request(app)
  .post("/api/mocks/seed")
  .send({ users: 1, deliveryPersons: 1, orders: 1, deliveries: 1 });
const loggerTest = await request(app).get("/api/logger/loggerTest");
process.stdout.write("RESULT:" + JSON.stringify({
  seed: { status: seed.status, error: seed.body.error },
  loggerTest: { status: loggerTest.status, error: loggerTest.body.error }
}) + "\\n");
await new Promise((resolve) => {
  logger.once("finish", resolve);
  logger.end();
});
`;
		const env = { ...process.env, NODE_ENV: "production" };
		delete env.MONGODB_URI;

		const result = spawnSync(
			process.execPath,
			["--input-type=module", "-e", productionProbe],
			{
				cwd: process.cwd(),
				env,
				encoding: "utf8",
				timeout: 8000,
			},
		);

		expect(result.error).to.be.undefined;
		expect(result.status).to.equal(0);
		const resultLine = result.stdout
			.split("\n")
			.find((line) => line.startsWith("RESULT:"));
		expect(resultLine).to.exist;
		const responses = JSON.parse(resultLine.slice("RESULT:".length));

		expect(responses.seed.status).to.equal(404);
		expect(responses.seed.error).to.equal("ROUTE_NOT_FOUND");
		expect(responses.loggerTest.status).to.equal(404);
		expect(responses.loggerTest.error).to.equal("ROUTE_NOT_FOUND");
	});
});
