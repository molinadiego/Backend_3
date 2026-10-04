import mongoose from "mongoose";
import logger from "../utils/logger.js";

import { config } from "./env.config.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        logger.info("Conexion a MongoDb establecida.");
    } catch (error) {
        logger.fatal("Error al conectar a MongoDB.", {
            error: error.message,
            stack: error.stack,
        });
        process.exit(1);
    }
};
