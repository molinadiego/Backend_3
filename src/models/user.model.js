import mongoose from "mongoose";
import { USER_ROLES, DOCUMENT_TYPES } from "../constants/index.js";

const documentSchema = new mongoose.Schema(
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
			enum: [DOCUMENT_TYPES.USER_DOCUMENT, DOCUMENT_TYPES.DRIVER_LICENSE],
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

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: Object.values(USER_ROLES),
			default: USER_ROLES.CUSTOMER,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		documents: {
			type: [documentSchema],
			default: [],
		},
	},
	{
		timestamps: true,
	},
);

export const UserModel = mongoose.model("User", userSchema);
