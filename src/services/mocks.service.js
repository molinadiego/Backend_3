import {
    generateUser,
    generateDeliveryPerson,
    generateOrder,
    generateDelivery,
    generateMany,
} from "../mocks/generators.js";
import { USER_ROLES } from "../constants/index.js";
import { ERRORS_CODES } from "../errors/errors.codes.js";
import { AppError } from "../errors/app.error.js";
import logger from "../utils/logger.js";

const MAX_QUANTITY = 50;

const validateQuantity = (quantity, allowZero = false) => {
    const minimum = allowZero ? 0 : 1;
    if (!Number.isInteger(quantity) || quantity < minimum) {
        throw new AppError(ERRORS_CODES.INVALID_MOCK_AMOUNT);
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
        const usersGenerated = await generateMany(generateUser, validQuantity);
        logger.info("Usuarios generados", {
            cantidad: usersGenerated.length,
        });
        return usersGenerated;
    }

    async generateDeliveryPersons(quantity = 5) {
        const validQuantity = validateQuantity(quantity);
        const deliveryGenerated = await generateMany(
            generateDeliveryPerson,
            validQuantity,
        );
        logger.info("Repartidores generados", {
            cantidad: deliveryGenerated.length,
        });
        return deliveryGenerated;
    }

    async generateOrders(quantity = 5) {
        const validQuantity = validateQuantity(quantity);

        const users = await generateMany(
            generateUser,
            validQuantity,
            USER_ROLES.CUSTOMER,
        );
        const ordersGenerated = users.map((user) => generateOrder(user));
        logger.info("Ordenes generadas.", {
            cantidad: ordersGenerated.length,
        });
        return ordersGenerated;
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
        const deliveriesGenerated = orders.map((order, index) =>
            generateDelivery(
                order,
                deliveryPersons[index % deliveryPersons.length],
            ),
        );
        logger.info("Deliveries generados.", {
            cantidad: deliveriesGenerated.length,
        });
        return deliveriesGenerated;
    }

    async seed({
        usersQty = 5,
        deliveryPersonsQty = 3,
        ordersQty = 10,
        deliveriesQty = 5,
    } = {}) {
        const validUsersQty = validateQuantity(usersQty, true);

        const validDeliveryPersonsQty = validateQuantity(
            deliveryPersonsQty,
            true,
        );

        const validOrdersQty = validateQuantity(ordersQty, true);

        const validDeliveriesQty = validateQuantity(deliveriesQty, true);

        if (!this.usersRepository || !this.ordersRepository) {
            throw new AppError(ERRORS_CODES.INTERNAL_SERVER_ERROR);
        }

        if (!this.deliveriesRepository) {
            throw new AppError(ERRORS_CODES.INTERNAL_SERVER_ERROR);
        }

        if (validOrdersQty > 0 && validUsersQty === 0) {
            throw new AppError(ERRORS_CODES.INVALID_MOCK_AMOUNT);
        }

        if (
            validDeliveriesQty > 0 &&
            (validOrdersQty === 0 || validDeliveryPersonsQty === 0)
        ) {
            throw new AppError(ERRORS_CODES.INVALID_MOCK_AMOUNT);
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

        logger.info("Seed completado correctamente", {
            usersInserted: savedUsers.length,
            deliveryPersonsInserted: savedDeliveryPersons.length,
            ordersInserted: savedOrders.length,
            deliveriesInserted: savedDeliveries.length,
        });

        return {
            usersInserted: savedUsers.length,
            deliveryPersonsInserted: savedDeliveryPersons.length,
            ordersInserted: savedOrders.length,
            deliveriesInserted: savedDeliveries.length,
        };
    }
}
