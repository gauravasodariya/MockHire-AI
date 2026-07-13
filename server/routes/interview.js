import express from "express"
import rateLimit from "express-rate-limit"
import { analyzeResume, generateQuestions,submitAnswers,finishInterview, getMyInterview,getInterviewReport } from "../controllers/interview.js"
import isAuth from "../middleware/isAuth.js"
import { uploads } from "../middleware/multer.js"

const router = express.Router()

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 requests per windowMs
  message: { message: "Too many requests from this IP, please try again later." }
})

router.post("/analyze-resume",isAuth,uploads.single("resume"),apiLimiter,analyzeResume)
router.post("/generate-questions",isAuth,apiLimiter,generateQuestions)
router.post("/submit-answer",isAuth,apiLimiter,submitAnswers)
router.post("/finish-interview",isAuth,finishInterview)
router.get("/get-interview",isAuth,getMyInterview)
router.get("/report/:id",isAuth,getInterviewReport)
export default router
