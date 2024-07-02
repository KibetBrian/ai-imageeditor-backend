import { Router } from "express";
import { getGeneratedImages } from "./image/queries";
import { generate } from "./image/generate";
import { verifyToken } from "../middleware/auth";

const generateRouter = Router();

generateRouter.get('/generate/images', getGeneratedImages);
generateRouter.post('/generate/image', verifyToken, generate);

export default generateRouter;