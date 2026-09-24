import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, min: 0, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

export const ProductModel = mongoose.model("Product", productSchema);
