import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { AI } from "../services/openRouter.js";
import User from "../models/user.js";
import Interview from "../models/interview.js";
import { uploadToS3, deleteFromS3 } from "../services/s3.js";

export const analyzeResume = async (req, res) => {
  let s3Url = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    const fileBuffer = req.file.buffer;
    const unit8Array = new Uint8Array(fileBuffer);
    const pdf = await pdfjsLib.getDocument({ data: unit8Array }).promise;

    let resumeText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      resumeText += pageText + " ";
    }
    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const message = [
      {
        role: "system",
        content: `You are an expert resume parser. Extract the following information from the resume and return ONLY a JSON object with these exact keys:
- "role": The most relevant job role the candidate is applying for or has experience in (e.g., "Software Engineer", "Frontend Developer")
- "experience": The total years of experience the candidate has (e.g., "3 years", "Fresher", "5+ years")
- "projects": An array of 3-5 project titles or short descriptions from the resume
- "skills": An array of 5-10 technical and soft skills from the resume

Return ONLY valid JSON without any markdown formatting, explanations, or extra text.`
      },
      {
        role: "user",
        content: resumeText
      }
    ];
    const aiResponse = await AI({ message });
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    }

    // Upload resume to S3 (optional but good to store)
    s3Url = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);

    res.json({
      role: parsedResponse.role || "",
      experience: parsedResponse.experience || "",
      projects: parsedResponse.projects || [],
      skills: parsedResponse.skills || [],
      resumeText: resumeText,
      resumeUrl: s3Url
    });
  } catch (err) {
    if (s3Url) {
      try {
        await deleteFromS3(s3Url);
      } catch (deleteErr) {
        console.error("Error deleting from S3:", deleteErr);
      }
    }
    return res.status(500).json({ message: err.message });
  }
};

export const generateQuestions = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res
        .status(400)
        .json({ message: "role, experience and mode are required" });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.credits < 50) {
      return res.status(403).json({
        message:
          "Insufficient credits. Minimum 50 credits required to generate questions",
      });
    }
    const projectText =
      Array.isArray(projects) && projects.length ? projects.join(", ") : "None";

    const skilltext =
      Array.isArray(skills) && skills.length ? skills.join(", ") : "None";

    const safeResumeText = resumeText?.trim() || "None";
    const userPrompt = `
        Role :${role}
        Experience :${experience}
        interviewMode :${mode}
        Projects :${projectText}
        Skills :${skilltext}
        Resume Text :${safeResumeText}
        `;
    if (!userPrompt || !userPrompt.trim()) {
      return res.status(400).json({ message: "Invalid user prompt" });
    }
    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate role, experience,interviewMode, projects, skills, and resume details.
`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];
    const aiResponse = await AI({ message: messages });
    if (!aiResponse || !aiResponse.trim()) {
      return res
        .status(500)
        .json({ message: "AI failed to generate questions" });
    }
    const questionsArray = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length == 0) {
      return res
        .status(500)
        .json({ message: "AI failed to generate questions" });
    }
    user.credits -= 50;
    await user.save();
    const interview = await Interview.create({
      userId: req.userId,
      role,
      experience,
      mode,
      resumeText: safeResumeText,
      questions: questionsArray.map((question, index) => ({
        question,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      })),
    });
    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions,
    });
  } catch (err) {
    return res.status(500).json({ message: `Failed to create interview: ${err.message}` });
  }
};
export const submitAnswers = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;
    const interview = await Interview.findById(interviewId);
     if(!interview){
      return res.status(404).json({ message: "Interview not found" });
    }
    
    const question = interview.questions[questionIndex];
    if (!question){
      return res.status(400).json({ message: "Invalid question index" });
    }

    if (!answer || !answer.trim()) {
      question.score = 0;
      question.feedback = "You did not provide an answer.";
      question.answer = "";
      await interview.save();
      return res.json({
        feedback: question.feedback,
      });
    }
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "You exceeded the time limit for this question.";
      question.answer = answer;
      await interview.save();
      return res.json({
        feedback: question.feedback,
      });
    }
    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 15 to 20 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`,
      },
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`,
      },
    ];
    const aiResponse = await AI({ message: messages });
    const parsedResponse = JSON.parse(aiResponse);
        
    question.answer = answer;
    question.confidence = parsedResponse.confidence;
    question.communication = parsedResponse.communication;
    question.correctness = parsedResponse.correctness;
    question.score = parsedResponse.finalScore;
    question.feedback = parsedResponse.feedback;
    await interview.save();

    return res.status(200).json({feedback: question.feedback});
  }
  
  catch (err) {
    return res.status(500).json({ message: `Failed to submit answer ${err.message}` });
  }
};
export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });      
    }
    const totalQuestions = interview.questions.length;
    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions
      ? totalScore / totalQuestions
      : 0;

    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
       finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        answer: q.answer || "",
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    })
  }
  catch (err) {
    return res.status(500).json({ message: `Failed to finish interview ${err.message}` });
  }
}
export const getMyInterview = async (req, res) => {
  try {
    const interview=await Interview.find({userId:req.userId}).sort({createdAt:-1})
    return res.status(200).json(interview);
  }
  catch(err){
    return res.status(500).json({ message: `Failed to fetch interview ${err.message}` });
  }
}
export const getInterviewReport=async(req,res)=>{
  try{
    const interview =await Interview.findById(req.params.id);
    if(!interview){
      return res.status(404).json({message:"Interview not found"})
    }
    const totalQuestions = interview.questions.length;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;
    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;
    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;
    
    return res.status(200).json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        answer: q.answer || "",
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      }))
    });
  }
  catch(err){
    return res.status(500).json({ message: `Failed to fetch interview report ${err.message}` });
  }
}