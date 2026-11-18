import { expect } from "chai";
import { spawnSync } from "node:child_process";

describe("Environment configuration", () => {
	const loadConfig = (overrides = {}) =>
		spawnSync(
			process.execPath,
			[
				"--input-type=module",
				"-e",
				'import { config } from "./src/config/env.config.js"; process.stdout.write(config.logLevel);',
			],
			{
				cwd: process.cwd(),
				env: {
					PATH: process.env.PATH,
					NODE_ENV: "development",
					PORT: "8080",
					MONGODB_URI: "mongodb://127.0.0.1:27017/config_test",
					JWT_SECRET: "unit-test-only-secret",
					LOG_LEVEL: "",
					...overrides,
				},
				encoding: "utf8",
			},
		);

	it("debería aplicar debug por defecto en desarrollo y testing e info en producción", () => {
		const development = loadConfig();
		const test = loadConfig({ NODE_ENV: "test" });
		const production = loadConfig({ NODE_ENV: "production" });

		expect(development.status).to.equal(0);
		expect(development.stdout).to.equal("debug");
		expect(test.status).to.equal(0);
		expect(test.stdout).to.equal("debug");
		expect(production.status).to.equal(0);
		expect(production.stdout).to.equal("info");
	});

	it("debería aceptar un nivel de logging permitido", () => {
		const result = loadConfig({ LOG_LEVEL: "warning" });

		expect(result.status).to.equal(0);
		expect(result.stdout).to.equal("warning");
	});

	it("debería fallar al iniciar con un nivel de logging inválido", () => {
		const result = loadConfig({ LOG_LEVEL: "verbose" });

		expect(result.status).to.not.equal(0);
		expect(result.stderr).to.include("LOG_LEVEL");
	});
});
