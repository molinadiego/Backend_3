import { mkdir, rename, unlink } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcrypt";
import { USER_ROLES, DOCUMENT_TYPES } from "../constants/index.js";
import { UPLOAD_DIRECTORIES } from "../config/multer.config.js";
import { AppError } from "../errors/app.error.js";
import { ERRORS_CODES } from "../errors/errors.codes.js";
import logger from "../utils/logger.js";
import { parsePagination } from "../utils/pagination.js";

export class UserService {
	constructor(userRepository) {
		this.userRepository = userRepository;
	}

	async getUsers(query = {}) {
		const pagination = parsePagination(query);
		const filter = {};

		if (query.role) {
			if (!Object.values(USER_ROLES).includes(query.role)) {
				throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
			}

			filter.role = query.role;
		}

		return this.userRepository.findAll(filter, pagination);
	}

	async getUserById(id) {
		const user = await this.userRepository.findById(id);

		if (!user) {
			throw new AppError(ERRORS_CODES.USER_NOT_FOUND);
		}

		return user;
	}

	async createUser(data) {
		const { name, email, password } = data;

		if (!name || !email || !password) {
			throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
		}

		const existingUser = await this.userRepository.findByEmail(email);

		if (existingUser) {
			throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
		}

		const newUser = await this.userRepository.create({
			name,
			email,
			password: await bcrypt.hash(password, 10),
			role: USER_ROLES.CUSTOMER,
		});

		logger.info("Usuario creado", {
			userId: newUser._id,
			role: newUser.role,
		});

		const userObj = newUser.toObject();
		delete userObj.password;

		return userObj;
	}

	async updateUser(id, data) {
		await this.getUserById(id);

		const { name, email, role, password } = data;
		const updateData = Object.fromEntries(
			Object.entries({ name, email, role }).filter(
				([, value]) => value !== undefined,
			),
		);

		if (password !== undefined) {
			if (!password) {
				throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
			}

			updateData.password = await bcrypt.hash(password, 10);
		}

		return this.userRepository.update(id, updateData);
	}

	async deleteUser(id) {
		await this.getUserById(id);

		return this.userRepository.softDelete(id);
	}

	async uploadDocument(id, file, documentType) {
		if (!file) {
			throw new AppError(ERRORS_CODES.FILE_REQUIRED);
		}

		try {
			const allowedDocumentTypes = [
				DOCUMENT_TYPES.USER_DOCUMENT,
				DOCUMENT_TYPES.DRIVER_LICENSE,
			];

			if (!allowedDocumentTypes.includes(documentType)) {
				throw new AppError(ERRORS_CODES.INVALID_DOCUMENT_TYPE);
			}

			const user = await this.getUserById(id);

			if (
				documentType === DOCUMENT_TYPES.DRIVER_LICENSE &&
				user.role !== USER_ROLES.DRIVER
			) {
				throw new AppError(ERRORS_CODES.INVALID_DOCUMENT_TYPE);
			}

			if (documentType === DOCUMENT_TYPES.DRIVER_LICENSE) {
				const destination = UPLOAD_DIRECTORIES.DRIVER_LICENSES;
				const newPath = path.join(destination, file.filename);

				await mkdir(destination, { recursive: true });
				await rename(file.path, newPath);

				file.path = newPath;
				file.destination = destination;
			}

			const documentMetadata = {
				originalName: file.originalname,
				filename: file.filename,
				path: file.path,
				mimetype: file.mimetype,
				size: file.size,
				documentType,
				uploadedAt: new Date(),
			};

			const updatedUser = await this.userRepository.addDocument(
				id,
				documentMetadata,
			);

			if (!updatedUser) {
				throw new AppError(ERRORS_CODES.USER_NOT_FOUND);
			}

			logger.info("Documento de usuario cargado correctamente", {
				userId: id,
				documentType,
				filename: file.filename,
				size: file.size,
			});

			return updatedUser;
		} catch (error) {
			try {
				await unlink(file.path);
			} catch (cleanupError) {
				if (cleanupError.code !== "ENOENT") {
					logger.error("No se pudo eliminar el archivo tras un error", {
						filename: file.filename,
						error: cleanupError.message,
					});
				}
			}

			if (error instanceof AppError) {
				throw error;
			}

			logger.error("Error al guardar documento de usuario", {
				userId: id,
				filename: file.filename,
				error: error.message,
			});

			throw new AppError(ERRORS_CODES.DOCUMENT_UPLOAD_FAILED);
		}
	}
}
