import mongoose from "mongoose";

import { ORDER_STATUS, DELIVERY_PRIORITY } from "../constants/constants.js";

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        deliveryAddress: {
            type: String,
            required: true,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.CREATED,
        },

        priority: {
            type: String,
            enum: Object.values(DELIVERY_PRIORITY),
            default: DELIVERY_PRIORITY.NORMAL,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

export const OrderModel = mongoose.model("Order", orderSchema);
