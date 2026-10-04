import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectDB } from "./config/database.js";
import logger from "./utils/logger.js";

const startServer = async () => {
    await connectDB();

    app.listen(config.port, () => {
        logger.info(`Servidor ShipNow corriendo en el puerto ${config.port}`);
    });
};

startServer();
