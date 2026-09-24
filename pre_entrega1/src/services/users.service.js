import { USER_ROLES } from "../constants/constants.js";

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
            throw new Error("Usuario no encontrado");
        }
        return user;
    }

    async createUser(data) {
        const { name, email, password, role } = data;

        if (!name || !email || !password) {
            throw new Error("Nombre, email y contraseña son obligatorios");
        }

        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error("El email ya se encuentra registrado");
        }

        if (role && !Object.values(USER_ROLES).includes(role)) {
            throw new Error("Rol no válido");
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
