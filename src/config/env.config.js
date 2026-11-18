import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

dotenv.config({ path: envFile });

const requiredEnvVars = ["PORT", "NODE_ENV", "MONGODB_URI", "JWT_SECRET"];

requiredEnvVars.forEach((envVar) => {
	if (!process.env[envVar]?.trim()) {
		throw new Error(
			`Falta configurar la variable de entorno obligatoria: ${envVar}`,
		);
	}
});

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
	throw new Error(
		"La variable PORT debe ser un número entero entre 1 y 65535.",
	);
}

const allowedEnvironments = ["development", "test", "production"];

if (!allowedEnvironments.includes(process.env.NODE_ENV)) {
	throw new Error(
		"La variable NODE_ENV debe ser development, test o production.",
	);
}

const allowedLogLevels = [
	"fatal",
	"error",
	"warning",
	"info",
	"http",
	"debug",
];
const defaultLogLevel =
	process.env.NODE_ENV === "production" ? "info" : "debug";
const logLevel = (process.env.LOG_LEVEL || defaultLogLevel).trim().toLowerCase();

if (!allowedLogLevels.includes(logLevel)) {
	throw new Error(
		`La variable LOG_LEVEL debe ser uno de: ${allowedLogLevels.join(", ")}.`,
	);
}

const apiBaseUrl = (process.env.API_BASE_URL || "http://localhost:8080").trim();

try {
	const parsedUrl = new URL(apiBaseUrl);

	if (
		!["http:", "https:"].includes(parsedUrl.protocol) ||
		parsedUrl.username ||
		parsedUrl.password
	) {
		throw new Error();
	}
} catch {
	throw new Error(
		"La variable API_BASE_URL debe ser una URL HTTP o HTTPS válida.",
	);
}

export const config = Object.freeze({
	port,
	mongoUri: process.env.MONGODB_URI,
	jwtSecret: process.env.JWT_SECRET,
	nodeEnv: process.env.NODE_ENV,
	logLevel,
	apiBaseUrl,
});
