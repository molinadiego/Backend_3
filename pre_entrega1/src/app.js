import express from "express";
import { UserRepository } from "./repositories/users.repository.js";
import { ProductRepository } from "./repositories/products.repository.js";
import { UserService } from "./services/users.service.js";
import { ProductService } from "./services/products.service.js";
import { UserController } from "./controllers/users.controller.js";
import { ProductController } from "./controllers/products.controller.js";
import { createUsersRouter } from "./routes/users.router.js";
import { createProductsRouter } from "./routes/products.router.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRepository = new UserRepository();
const productRepository = new ProductRepository();

const userService = new UserService(userRepository);
const productService = new ProductService(productRepository);

const userController = new UserController(userService);
const productController = new ProductController(productService);

app.use("/api/users", createUsersRouter(userController));
app.use("/api/products", createProductsRouter(productController));

app.use(errorHandler);

export default app;
