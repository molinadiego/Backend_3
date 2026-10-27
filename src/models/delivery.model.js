import { Schema, model } from "mongoose";
import { DELIVERY_STATUS, DOCUMENT_TYPES } from "../constants/index.js";

const proofSchema = new Schema(
	{
		originalName: {
			type: String,
			required: true,
		},
		filename: {
			type: String,
			required: true,
		},
		path: {
			type: String,
			required: true,
		},
		mimetype: {
			type: String,
			required: true,
		},
		size: {
			type: Number,
			required: true,
			min: 1,
		},
		documentType: {
			type: String,
			enum: [DOCUMENT_TYPES.DELIVERY_PROOF],
			default: DOCUMENT_TYPES.DELIVERY_PROOF,
			required: true,
		},
		uploadedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		_id: true,
	},
);

const deliverySchema = new Schema(
	{
		order: {
			type: Schema.Types.ObjectId,
			ref: "Order",
			required: true,
		},
		deliveryPerson: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		status: {
			type: String,
			enum: Object.values(DELIVERY_STATUS),
			default: DELIVERY_STATUS.PENDING,
		},
		address: {
			type: String,
			required: true,
		},
		estimatedDeliveryDate: {
			type: Date,
		},
		proof: {
			type: proofSchema,
			default: null,
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

export const DeliveryModel = model("Delivery", deliverySchema);
