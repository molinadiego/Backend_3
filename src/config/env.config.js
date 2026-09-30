import dotenv from "dotenv";

dotenv.config();

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

export const config = Object.freeze({
    port,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
});
