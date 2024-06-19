import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { syncAuth } from "./auth";

const authRouter = Router();

authRouter.post("/auth/sync", verifyToken, syncAuth);

export default authRouter;