import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectDB, disconnectDB } from "./config/database.js";
import logger from "./utils/logger.js";

const startServer = async () => {
	await connectDB();

	const server = app.listen(config.port, () => {
		logger.info(`Servidor ShipNow corriendo en el puerto ${config.port}`);
	});
	let shutdownPromise;

	const shutdown = (signal) => {
		if (shutdownPromise) {
			return shutdownPromise;
		}

		shutdownPromise = (async () => {
			logger.info("Iniciando cierre ordenado del servidor", { signal });

			try {
				await new Promise((resolve, reject) => {
					server.close((error) => (error ? reject(error) : resolve()));
				});
			} catch (error) {
				logger.error("Error al cerrar el servidor HTTP", {
					signal,
					error: error.message,
				});
				process.exitCode = 1;
			}

			try {
				await disconnectDB();
				logger.info("Conexión a MongoDB cerrada", { signal });
			} catch (error) {
				logger.error("Error al cerrar la conexión a MongoDB", {
					signal,
					error: error.message,
				});
				process.exitCode = 1;
			}

			await new Promise((resolve) => {
				logger.once("finish", resolve);
				logger.end();
			});
		})();

		return shutdownPromise;
	};

	process.once("SIGTERM", () => {
		void shutdown("SIGTERM");
	});

	process.once("SIGINT", () => {
		void shutdown("SIGINT");
	});
};

startServer();
