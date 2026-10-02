import { USER_ROLES } from "../constants/index.js";
import { AppError } from "../errors/app.error.js";
import { ERRORS_CODES } from "../errors/errors.codes.js";

export class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async getUsers() {
        return this.userRepository.findAll();
    }

    async getUserById(id) {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new AppError(ERRORS_CODES.USER_NOT_FOUND);
        }

        return user;
    }

    async createUser(data) {
        const { name, email, password, role } = data;

        if (!name || !email || !password) {
            throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
        }

        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
        }

        if (role && !Object.values(USER_ROLES).includes(role)) {
            throw new AppError(ERRORS_CODES.VALIDATION_ERROR);
        }

        const newUser = await this.userRepository.create({
            name,
            email,
            password,
            role: role || USER_ROLES.CUSTOMER,
        });

        const userObj = newUser.toObject();

        delete userObj.password;

        return userObj;
    }

    async updateUser(id, data) {
        await this.getUserById(id);

        return this.userRepository.update(id, data);
    }

    async deleteUser(id) {
        await this.getUserById(id);

        return this.userRepository.softDelete(id);
    }
}
