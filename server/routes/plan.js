import express from "express";
import { getAllPlans, getPlanById } from "../controllers/plan.js";

const router = express.Router();

router.get("/", getAllPlans);
router.get("/:planId", getPlanById);

export default router;
