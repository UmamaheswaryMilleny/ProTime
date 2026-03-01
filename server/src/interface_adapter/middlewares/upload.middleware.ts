import multer from "multer";

// Configure multer to store files in memory as Buffers
const storage = multer.memoryStorage();

// Multer filter to ensure only images are uploaded
const fileFilter = (
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

// Export the configured multer instance
export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max file size
    },
});


// import multer from 'multer';
// import type { Request, Response, NextFunction } from 'express';
// import { HTTP_STATUS } from '../../shared/constants/constants';

// const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// // Memory storage — file lands in req.file.buffer as a Buffer.
// // Never written to disk — passed directly to Cloudinary upload_stream.
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: MAX_SIZE_BYTES },
//   fileFilter: (_req, file, cb) => {
//     if (ALLOWED_TYPES.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only JPEG, PNG and WebP images are allowed'));
//     }
//   },
// });

// // Single file upload under field name 'avatar'
// // Wraps multer to handle its errors consistently with our error format
// export const uploadAvatarMiddleware = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): void => {
//   upload.single('avatar')(req, res, (err) => {
//     if (err instanceof multer.MulterError) {
//       if (err.code === 'LIMIT_FILE_SIZE') {
//         res.status(HTTP_STATUS.BAD_REQUEST).json({
//           success: false,
//           message: 'Image must be smaller than 5MB',
//         });
//         return;
//       }
//       res.status(HTTP_STATUS.BAD_REQUEST).json({
//         success: false,
//         message: err.message,
//       });
//       return;
//     }

//     if (err) {
//       res.status(HTTP_STATUS.BAD_REQUEST).json({
//         success: false,
//         message: err.message,
//       });
//       return;
//     }

//     next();
//   });
// };
