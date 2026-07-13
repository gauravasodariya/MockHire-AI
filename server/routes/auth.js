import express from "express"
import {googleAuth,logout} from "../controllers/auth.js"

const router = express.Router()

router.post("/google",googleAuth)
router.get("/logout",logout);

export default router