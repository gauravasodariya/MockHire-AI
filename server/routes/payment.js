import express from "express";
const router = express.Router();
import { createOrder, verifyPayment } from "../controllers/payment.js";
import isAuth from "../middleware/isAuth.js";

router.post("/order",isAuth,createOrder);
router.post("/verify", isAuth, verifyPayment);

export default router;          