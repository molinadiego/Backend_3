import logger from "../utils/logger.js";

export const loggerTest = (req, res) => {
    logger.debug("log de nivel debug");
    logger.http("log de nivel http");
    logger.info("log de nivel info");
    logger.warning("log de nivel warning");
    logger.error("log de nivel error");
    logger.fatal("log de nivel fatal");

    res.json({
        status: "success",
        message: "logs generados correctamente",
    });
};
