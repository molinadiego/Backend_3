import mongoose from "mongoose";
import { USER_ROLES } from "../constants/constants.js";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            default: USER_ROLES.CUSTOMER,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

export const UserModel = mongoose.model("User", userSchema);
