import express from "express";

import { UserRepository } from "./repositories/users.repository.js";
import { OrderRepository } from "./repositories/orders.repository.js";

import { UserService } from "./services/users.service.js";
import { OrderService } from "./services/orders.service.js";

import { UserController } from "./controllers/users.controller.js";
import { OrderController } from "./controllers/orders.controller.js";

import { createUsersRouter } from "./routes/users.router.js";
import { createOrdersRouter } from "./routes/orders.router.js";

import { UserModel } from "./models/user.model.js";
import { OrderModel } from "./models/order.model.js";

import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRepository = new UserRepository(UserModel);
const orderRepository = new OrderRepository(OrderModel);

const userService = new UserService(userRepository);
const orderService = new OrderService(orderRepository);

const userController = new UserController(userService);
const orderController = new OrderController(orderService);

app.use("/api/users", createUsersRouter(userController));
app.use("/api/orders", createOrdersRouter(orderController));

app.use(errorHandler);

export default app;
