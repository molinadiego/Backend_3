export class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async getAll(req, res, next) {
        try {
            const users = await this.userService.getUsers();
            res.status(200).json({ status: "success", data: users });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const user = await this.userService.getUserById(req.params.id);
            res.status(200).json({ status: "success", data: user });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newUser = await this.userService.createUser(req.body);
            res.status(201).json({ status: "success", data: newUser });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updated = await this.userService.updateUser(
                req.params.id,
                req.body,
            );
            res.status(200).json({ status: "success", data: updated });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await this.userService.deleteUser(req.params.id);
            res.status(200).json({
                status: "success",
                message: "Usuario eliminado correctamente",
            });
        } catch (error) {
            next(error);
        }
    }
}
