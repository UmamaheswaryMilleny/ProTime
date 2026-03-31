import multer from "multer";

const storage = multer.memoryStorage();

// Profile Image Upload Middleware (Existing)
const profileFileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
) => {
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (validMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, and WEBP are allowed"));
    }
};

export const uploadMiddleware = multer({
    storage,
    fileFilter: profileFileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max
    },
});

// Chat Attachment Upload Middleware (New)
const chatFileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
) => {
    const validMimeTypes = [
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ];

    if (validMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Allowed: Images, PDF, Word, and Text files."));
    }
};

export const chatUploadMiddleware = multer({
    storage,
    fileFilter: chatFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});
