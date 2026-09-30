import express from "express";

import { UserModel } from "./models/user.model.js";
import { OrderModel } from "./models/order.model.js";
import { DeliveryModel } from "./models/delivery.model.js";

import { UserRepository } from "./repositories/users.repository.js";
import { OrderRepository } from "./repositories/orders.repository.js";
import { DeliveryRepository } from "./repositories/deliveries.repository.js";

import { MocksService } from "./services/mocks.service.js";

import { MocksController } from "./controllers/mocks.controller.js";

import { createMocksRouter } from "./routes/mocks.router.js";

import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const userRepository = new UserRepository(UserModel);

const orderRepository = new OrderRepository(OrderModel);

const deliveryRepository = new DeliveryRepository(DeliveryModel);

const mocksService = new MocksService(
    userRepository,
    orderRepository,
    deliveryRepository,
);

const mocksController = new MocksController(mocksService);

app.use("/api/mocks", createMocksRouter(mocksController));

app.use(errorHandler);

export default app;
