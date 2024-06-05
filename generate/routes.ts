import { Router } from "express";
import { generate } from "./generate";

const generateRouter = Router();

generateRouter.post("/generate", generate);

export default generateRouter;