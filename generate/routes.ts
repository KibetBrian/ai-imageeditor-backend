import { Router } from "express";
import { simulate } from "./image/simulate";
import { getGeneratedImages } from "./image/queries";

const generateRouter = Router();

generateRouter.get('/generate/images', getGeneratedImages);
generateRouter.post('/generate/image', simulate);

export default generateRouter;