import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.resolve(currentDirectory, "../../uploads");

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const UPLOAD_DIRECTORIES = Object.freeze({
	USER_DOCUMENTS: path.join(uploadsDirectory, "documents"),
	DRIVER_LICENSES: path.join(uploadsDirectory, "licenses"),
	DELIVERY_PROOFS: path.join(uploadsDirectory, "proofs"),
});

export const getRelativeUploadPath = (filePath) => {
	const relativePath = path.relative(uploadsDirectory, filePath);

	if (
		!relativePath ||
		relativePath === ".." ||
		relativePath.startsWith(`..${path.sep}`) ||
		path.isAbsolute(relativePath)
	) {
		throw new Error("La ruta del archivo no pertenece al directorio uploads.");
	}

	return path.posix.join(
		"uploads",
		relativePath.split(path.sep).join(path.posix.sep),
	);
};

export const ALLOWED_MIME_TYPES = Object.freeze({
	"application/pdf": ".pdf",
	"image/jpeg": ".jpg",
	"image/png": ".png",
	"image/webp": ".webp",
});

export const initializeUploadDirectories = async () => {
	await Promise.all(
		Object.values(UPLOAD_DIRECTORIES).map((directory) =>
			mkdir(directory, { recursive: true }),
		),
	);
};

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		const isProof = req.baseUrl === "/api/deliveries";

		const destination = isProof
			? UPLOAD_DIRECTORIES.DELIVERY_PROOFS
			: UPLOAD_DIRECTORIES.USER_DOCUMENTS;

		mkdir(destination, { recursive: true })
			.then(() => callback(null, destination))
			.catch(callback);
	},

	filename: (req, file, callback) => {
		const extension = ALLOWED_MIME_TYPES[file.mimetype];

		callback(null, `${randomUUID()}${extension || ""}`);
	},
});

const fileFilter = (req, file, callback) => {
	if (!Object.hasOwn(ALLOWED_MIME_TYPES, file.mimetype)) {
		return callback(new Error("INVALID_FILE_TYPE"));
	}

	callback(null, true);
};

export const uploadFile = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: MAX_FILE_SIZE,
		files: 1,
	},
});
