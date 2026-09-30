import {
    generateUser,
    generateDeliveryPerson,
    generateOrder,
    generateDelivery,
    generateMany,
} from "../mocks/generators.js";

import { USER_ROLES } from "../constants/index.js";

const MAX_QUANTITY = 50;

const validateQuantity = (
    quantity,
    fieldName = "cantidad",
    allowZero = false,
) => {
    const minimum = allowZero ? 0 : 1;

    if (!Number.isInteger(quantity) || quantity < minimum) {
        throw new Error(
            `El parámetro ${fieldName} debe ser un entero mayor o igual a ${minimum}`,
        );
    }

    return Math.min(quantity, MAX_QUANTITY);
};

export class MocksService {
    constructor(usersRepository, ordersRepository, deliveriesRepository) {
        this.usersRepository = usersRepository;
        this.ordersRepository = ordersRepository;
        this.deliveriesRepository = deliveriesRepository;
    }

    async generateUsers(quantity = 5) {
        const validQuantity = validateQuantity(quantity);

        return generateMany(generateUser, validQuantity);
    }

    async generateDeliveryPersons(quantity = 5) {
        const validQuantity = validateQuantity(quantity);

        return generateMany(generateDeliveryPerson, validQuantity);
    }

    async generateOrders(quantity = 5) {
        const validQuantity = validateQuantity(quantity);

        const users = await generateMany(
            generateUser,
            validQuantity,
            USER_ROLES.CUSTOMER,
        );

        return users.map((user) => generateOrder(user));
    }

    async generateDeliveries(quantity = 5) {
        const validQuantity = validateQuantity(quantity);

        const users = await generateMany(
            generateUser,
            validQuantity,
            USER_ROLES.CUSTOMER,
        );

        const deliveryPersons = await generateMany(
            generateDeliveryPerson,
            validQuantity,
        );

        const orders = users.map((user) => generateOrder(user));

        return orders.map((order, index) =>
            generateDelivery(
                order,
                deliveryPersons[index % deliveryPersons.length],
            ),
        );
    }

    async seed({
        usersQty = 5,
        deliveryPersonsQty = 3,
        ordersQty = 10,
        deliveriesQty = 5,
    } = {}) {
        const validUsersQty = validateQuantity(usersQty, "usersQty", true);

        const validDeliveryPersonsQty = validateQuantity(
            deliveryPersonsQty,
            "deliveryPersonsQty",
            true,
        );

        const validOrdersQty = validateQuantity(ordersQty, "ordersQty", true);

        const validDeliveriesQty = validateQuantity(
            deliveriesQty,
            "deliveriesQty",
            true,
        );

        if (!this.usersRepository || !this.ordersRepository) {
            throw new Error(
                "Los repositorios de usuarios y pedidos son requeridos",
            );
        }

        if (!this.deliveriesRepository) {
            throw new Error(
                "El repositorio de entregas es requerido para ejecutar el seed",
            );
        }

        if (validOrdersQty > 0 && validUsersQty === 0) {
            throw new Error(
                "Se requiere al menos un usuario para generar pedidos vinculados",
            );
        }

        if (
            validDeliveriesQty > 0 &&
            (validOrdersQty === 0 || validDeliveryPersonsQty === 0)
        ) {
            throw new Error(
                "Se requieren pedidos y repartidores para generar entregas vinculadas",
            );
        }

        const rawUsers = await generateMany(
            generateUser,
            validUsersQty,
            USER_ROLES.CUSTOMER,
        );

        const rawDeliveryPersons = await generateMany(
            generateDeliveryPerson,
            validDeliveryPersonsQty,
        );

        const savedUsers = await Promise.all(
            rawUsers.map((user) => this.usersRepository.create(user)),
        );

        const savedDeliveryPersons = await Promise.all(
            rawDeliveryPersons.map((deliveryPerson) =>
                this.usersRepository.create(deliveryPerson),
            ),
        );

        const rawOrders = Array.from({ length: validOrdersQty }, (_, index) =>
            generateOrder(savedUsers[index % savedUsers.length]),
        );

        const savedOrders = await Promise.all(
            rawOrders.map((order) => this.ordersRepository.create(order)),
        );

        const rawDeliveries = Array.from(
            { length: validDeliveriesQty },
            (_, index) =>
                generateDelivery(
                    savedOrders[index % savedOrders.length],
                    savedDeliveryPersons[index % savedDeliveryPersons.length],
                ),
        );

        const savedDeliveries = await Promise.all(
            rawDeliveries.map((delivery) =>
                this.deliveriesRepository.create(delivery),
            ),
        );

        return {
            usersInserted: savedUsers.length,
            deliveryPersonsInserted: savedDeliveryPersons.length,
            ordersInserted: savedOrders.length,
            deliveriesInserted: savedDeliveries.length,
        };
    }
}
