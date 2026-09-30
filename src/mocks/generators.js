import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

import {
    USER_ROLES,
    ORDER_STATUS,
    DELIVERY_PRIORITY,
    DELIVERY_STATUS,
} from "../constants/index.js";

const choose = (object) => faker.helpers.arrayElement(Object.values(object));

export const generateUser = async (role = null) => {
    const assignedRole =
        role ||
        faker.helpers.arrayElement([USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]);

    return {
        _id: new mongoose.Types.ObjectId(),
        name: `${faker.person.firstName()} ${faker.person.lastName()}`,
        email: faker.internet.email().toLowerCase(),
        password: await bcrypt.hash("coder123", 10),
        role: assignedRole,
        isActive: true,
    };
};

export const generateDeliveryPerson = async () =>
    generateUser(USER_ROLES.DRIVER);

export const generateOrder = (user = null) => ({
    _id: new mongoose.Types.ObjectId(),
    userId: user?._id ?? new mongoose.Types.ObjectId(),
    deliveryAddress: faker.location.streetAddress(),
    total: faker.number.float({
        min: 10,
        max: 500,
        fractionDigits: 2,
    }),
    status: choose(ORDER_STATUS),
    priority: choose(DELIVERY_PRIORITY),
    isActive: true,
});

export const generateDelivery = (order = null, deliveryPerson = null) => ({
    _id: new mongoose.Types.ObjectId(),
    order: order?._id ?? new mongoose.Types.ObjectId(),
    deliveryPerson: deliveryPerson?._id ?? new mongoose.Types.ObjectId(),
    address: order?.deliveryAddress ?? faker.location.streetAddress(),
    status: choose(DELIVERY_STATUS),
    estimatedDeliveryDate: faker.date.soon({ days: 3 }),
});

export const generateMany = async (fn, quantity, ...args) =>
    Promise.all(Array.from({ length: quantity }, () => fn(...args)));
