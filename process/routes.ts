import { Router } from "express";
import { generate } from "./generate";
import { removeBackground } from "./background_remover/backgroundRemover";
import multer from 'multer';

const validTypes = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, callback) {
    if (!validTypes.includes(file.mimetype)){
      callback(null, false);
    }

    callback(null, true);
  }

});

const processRouter = Router();

processRouter.post("/generate", generate);
processRouter.post('/process/background-removal', upload.array('files'),  removeBackground);

export default processRouter;