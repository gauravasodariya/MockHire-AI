import express from "express"
import isAuth from "../middleware/isAuth.js"
import { getCurrentUser } from "../controllers/user.js";
const router = express.Router()

router.get("/currentUser",isAuth,getCurrentUser);
export default router