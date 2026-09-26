import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

import {
    USER_ROLES,
    ORDER_STATUS,
    DELIVERY_PRIORITY,
} from "../constants/constants.js";

const choose = (object) => faker.helpers.arrayElement(Object.values(object));

export const generateUser = async (role = USER_ROLES.CUSTOMER) => ({
    _id: new mongoose.Types.ObjectId(),
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    email: faker.internet.email().toLowerCase(),
    password: await bcrypt.hash("coder123", 10),
    role,
    isActive: true,
});

export const generateOrder = (user = null) => ({
    userId: user?._id ?? null,
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

export const generateMany = async (fn, quantity, ...args) =>
    Promise.all(Array.from({ length: quantity }, () => fn(...args)));
