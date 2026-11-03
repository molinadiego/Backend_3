export class UserController {
	constructor(userService) {
		this.userService = userService;
	}

	getAll = async (req, res, next) => {
		try {
			const result = await this.userService.getUsers(req.query);

			return res.status(200).json({
				status: "success",
				data: result.items,
				pagination: result.pagination,
			});
		} catch (error) {
			next(error);
		}
	};

	getById = async (req, res, next) => {
		try {
			const user = await this.userService.getUserById(req.params.id);

			return res.status(200).json({
				status: "success",
				data: user,
			});
		} catch (error) {
			next(error);
		}
	};

	create = async (req, res, next) => {
		try {
			const user = await this.userService.createUser(req.body);

			return res.status(201).json({
				status: "success",
				data: user,
			});
		} catch (error) {
			next(error);
		}
	};

	update = async (req, res, next) => {
		try {
			const user = await this.userService.updateUser(req.params.id, req.body);

			return res.status(200).json({
				status: "success",
				data: user,
			});
		} catch (error) {
			next(error);
		}
	};

	delete = async (req, res, next) => {
		try {
			await this.userService.deleteUser(req.params.id);

			return res.status(200).json({
				status: "success",
				message: "Usuario eliminado correctamente.",
			});
		} catch (error) {
			next(error);
		}
	};

	uploadDocument = async (req, res, next) => {
		try {
			const user = await this.userService.uploadDocument(
				req.params.id,
				req.file,
				req.body.documentType,
			);

			return res.status(200).json({
				status: "success",
				data: user,
			});
		} catch (error) {
			next(error);
		}
	};
}
