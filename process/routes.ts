import { NextFunction, Router, Request, Response } from "express"; // Added Response here
import { generate } from "./generate";
import { getProcessedImages, removeBackground } from "./background_remover/backgroundRemover";
import multer, { FileFilterCallback, MulterError } from 'multer'; // Imported File and added it to the imports
import { removeObject } from "./object_erasal/object_removal";
import { StatusCodes } from "http-status-codes";
import path from 'path';
import { verifyToken } from "../middleware/auth";

// eslint-disable-next-line no-magic-numbers
const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB

const fileFilter = (req: Request, file:Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP files are allowed.'));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
}).array('files');

const fileUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upload(req, res, (err: any) => {
    if (err instanceof MulterError) {
  
      return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
    } else if (err) {

      return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
    }
    
    next();
  });
};

const processRouter = Router();

processRouter.post("/generate", generate);
processRouter.post('/process/background-removal', verifyToken, fileUploadMiddleware, removeBackground);

processRouter.post('/process/background-removal/processed', verifyToken, getProcessedImages);

processRouter.post('/process/object-removal', fileUploadMiddleware, removeObject);

export default processRouter;
