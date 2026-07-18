import express from "express"
import rateLimit from "express-rate-limit"
import { analyzeResume, generateQuestions,submitAnswers,finishInterview, getMyInterview,getInterviewReport } from "../controllers/interview.js"
import isAuth from "../middleware/isAuth.js"
import { uploads } from "../middleware/multer.js"

const router = express.Router()

const apiLimiter = rateLimit({
  windowMs: 25 * 60 * 1000, // 25 minutes
  limit: 50, // Limit each IP to 50 requests per windowMs
  message: { message: "Too many requests from this IP, please try again later." }
})

router.post("/analyze-resume",isAuth,uploads.single("resume"),analyzeResume)
router.post("/generate-questions",isAuth,generateQuestions)
router.post("/submit-answer",isAuth,submitAnswers)
router.post("/finish-interview",isAuth,finishInterview)
router.get("/get-interview",isAuth,getMyInterview)
router.get("/report/:id",isAuth,getInterviewReport)
export default router
