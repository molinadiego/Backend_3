import { asyncHandler } from "../middlewares/async-handler.middleware.js";

export class UserController {
    constructor(userService) {
        this.userService = userService;

        this.getAll = asyncHandler(this.getAll.bind(this));
        this.getById = asyncHandler(this.getById.bind(this));
        this.create = asyncHandler(this.create.bind(this));
        this.update = asyncHandler(this.update.bind(this));
        this.delete = asyncHandler(this.delete.bind(this));
    }

    async getAll(req, res) {
        const users = await this.userService.getUsers();
        res.status(200).json({ status: "success", data: users });
    }

    async getById(req, res) {
        const user = await this.userService.getUserById(req.params.id);
        res.status(200).json({ status: "success", data: user });
    }

    async create(req, res) {
        const newUser = await this.userService.createUser(req.body);
        res.status(201).json({ status: "success", data: newUser });
    }

    async update(req, res) {
        const updated = await this.userService.updateUser(
            req.params.id,
            req.body,
        );

        res.status(200).json({ status: "success", data: updated });
    }

    async delete(req, res) {
        await this.userService.deleteUser(req.params.id);

        res.status(200).json({
            status: "success",
            message: "Usuario eliminado correctamente",
        });
    }
}
