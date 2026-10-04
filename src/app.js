import express from "express";

import { UserModel } from "./models/user.model.js";
import { OrderModel } from "./models/order.model.js";
import { DeliveryModel } from "./models/delivery.model.js";
import { ProductModel } from "./models/product.model.js";

import { UserRepository } from "./repositories/users.repository.js";
import { OrderRepository } from "./repositories/orders.repository.js";
import { DeliveryRepository } from "./repositories/deliveries.repository.js";
import { ProductRepository } from "./repositories/products.repository.js";

import { UserService } from "./services/users.service.js";
import { OrderService } from "./services/orders.service.js";
import { ProductService } from "./services/products.service.js";
import { MocksService } from "./services/mocks.service.js";

import { UserController } from "./controllers/users.controller.js";
import { OrderController } from "./controllers/orders.controller.js";
import { ProductController } from "./controllers/products.controller.js";
import { MocksController } from "./controllers/mocks.controller.js";

import { createUsersRouter } from "./routes/users.router.js";
import { createOrdersRouter } from "./routes/orders.router.js";
import { createProductRouter } from "./routes/products.router.js";
import { createMocksRouter } from "./routes/mocks.router.js";
import { createLoggerRouter } from "./routes/logger.router.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import { routeNotFound } from "./middlewares/notfound.middleware.js";
import { httpMiddleware } from "./middlewares/http.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpMiddleware);

const userRepository = new UserRepository(UserModel);
const orderRepository = new OrderRepository(OrderModel);
const deliveryRepository = new DeliveryRepository(DeliveryModel);
const productRepository = new ProductRepository(ProductModel);

const userService = new UserService(userRepository);
const orderService = new OrderService(orderRepository);
const productService = new ProductService(productRepository);

const mocksService = new MocksService(
    userRepository,
    orderRepository,
    deliveryRepository,
);

const userController = new UserController(userService);
const orderController = new OrderController(orderService);
const productController = new ProductController(productService);
const mocksController = new MocksController(mocksService);

app.use("/api/users", createUsersRouter(userController));
app.use("/api/orders", createOrdersRouter(orderController));
app.use("/api/products", createProductRouter(productController));
app.use("/api/mocks", createMocksRouter(mocksController));
app.use("/api/logger", createLoggerRouter());

app.use(routeNotFound);
app.use(errorHandler);

export default app;
