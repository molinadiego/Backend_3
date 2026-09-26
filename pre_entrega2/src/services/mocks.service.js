import {
    generateUser,
    generateOrder,
    generateMany,
} from "../mocks/generators.js";

import { USER_ROLES } from "../constants/constants.js";

export class MocksService {
    constructor(usersRepository, ordersRepository) {
        this.usersRepository = usersRepository;
        this.ordersRepository = ordersRepository;
    }

    async generateUsers(quantity = 5) {
        return generateMany(generateUser, quantity);
    }

    async generateOrders(quantity = 5) {
        const users = await generateMany(
            generateUser,
            quantity,
            USER_ROLES.CUSTOMER,
        );

        return users.map((user) => ({
            ...generateOrder(user),
        }));
    }

    async seed(usersQuantity = 5, ordersQuantity = 10) {
        const users = await generateMany(
            generateUser,
            usersQuantity,
            USER_ROLES.CUSTOMER,
        );

        const savedUsers = await Promise.all(
            users.map((user) => this.usersRepository.create(user)),
        );

        const orders = Array.from({ length: ordersQuantity }, (_, index) =>
            generateOrder(savedUsers[index % savedUsers.length]),
        );

        await Promise.all(
            orders.map((order) => this.ordersRepository.create(order)),
        );

        return {
            usersInserted: savedUsers.length,
            ordersInserted: orders.length,
        };
    }
}
