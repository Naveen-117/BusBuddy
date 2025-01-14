import express from "express";
import { authen } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/authen", authen);

export default router;
