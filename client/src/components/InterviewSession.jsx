import React, { useState, useRef, useEffect } from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer'
import { motion, AnimatePresence } from "framer-motion"
import { FaMicrophone, FaMicrophoneSlash, FaVideo } from "react-icons/fa"
import axios from "axios"
import { serverUrl } from '../App'
import * as faceapi from '@vladmandic/face-api'

function InterviewSession({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const [error, setError] = useState("");
  const [webcamFeedback, setWebcamFeedback] = useState("");
  
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  let lookingAwayCount = 0;
  let totalFrames = 0;

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
        );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
        );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

  }, [])

  useEffect(() => {
    const loadFaceApiModels = async () => {
      try {
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model"
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
      } catch (err) {
        console.log("Error loading face-api models:", err)
      }
    }
    loadFaceApiModels()
  }, [])

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      })
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream
        webcamRef.current.play()
      }
      setIsCameraOn(true)
      startFaceDetection()
    } catch (err) {
      console.log("Error accessing webcam:", err)
      setWebcamFeedback("Could not access webcam.")
    }
  }

  const stopWebcam = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      webcamRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
    setIsCameraOn(false)
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
    }
  }

  const startFaceDetection = () => {
    detectionIntervalRef.current = setInterval(async () => {
      if (webcamRef.current && canvasRef.current && !isAIPlaying) {
        const options = new faceapi.TinyFaceDetectorOptions()
        const result = await faceapi.detectSingleFace(webcamRef.current, options).withFaceLandmarks()
        
        if (result) {
          totalFrames++
          const nose = result.landmarks.getNose()
          const leftEye = result.landmarks.getLeftEye()
          const rightEye = result.landmarks.getRightEye()
          
          const noseX = nose[30].x
          const leftEyeX = leftEye[0].x
          const rightEyeX = rightEye[0].x
          const faceWidth = rightEyeX - leftEyeX
          const eyeCenterX = (leftEyeX + rightEyeX) / 2
          
          const offset = Math.abs(noseX - eyeCenterX)
          if (offset > faceWidth * 0.25) {
            lookingAwayCount++
          }
          
          if (totalFrames > 30) {
            const lookingAwayPercentage = (lookingAwayCount / totalFrames) * 100
            if (lookingAwayPercentage > 60) {
              setWebcamFeedback("Try to look at the camera more!")
            } else if (lookingAwayPercentage > 30) {
              setWebcamFeedback("Good, but try to maintain eye contact.")
            } else {
              setWebcamFeedback("Great eye contact!")
            }
            totalFrames = 0
            lookingAwayCount = 0
          }
        }
      }
    }, 100)
  }

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      utterance.rate = 0.92;    
      utterance.pitch = 1.05;   
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);

        if (isMicOn) {
          startMic();
        }
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };
      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) {
      return;
    }
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        setIsIntroPhase(false);
      } else if (questions[currentIndex]) {
        await new Promise(r => setTimeout(r, 800));

        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(questions[currentIndex].question);

        if (isMicOn) {
          startMic();
        }
      }
    }

    runIntro()
  }, [selectedVoice, isIntroPhase, currentIndex])

  useEffect(() => {
    if (isIntroPhase) return;
    if (!questions[currentIndex]) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0;
        }
        return prev - 1

      })
    }, 1000);

    return () => clearInterval(timer)

  }, [isIntroPhase, currentIndex])

  useEffect(() => {
    if (!isIntroPhase && questions[currentIndex]) {
      setTimeLeft(questions[currentIndex].timeLimit || 60);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;

  }, []);


  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch { }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;
    setError("");
    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(serverUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken: questions[currentIndex].timeLimit - timeLeft,
      }, { withCredentials: true });

      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
      setIsSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit answer. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    setError("");
    setWebcamFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);
  };

  const finishInterview = async () => {
    stopMic();
    stopWebcam();
    setIsMicOn(false);
    setError("");
    try {
      const result = await axios.post(serverUrl + "/api/interview/finish-interview", { interviewId }, { withCredentials: true });

      console.log(result.data);
      onFinish(result.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete interview. Please try again.");
    }
  };

  useEffect(() => {
    if (isIntroPhase) return;
    if (!questions[currentIndex]) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }

      window.speechSynthesis.cancel();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
      stopWebcam()
    };
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-6xl min-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>
        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {subtitle && (
            <div className='w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
          )}

          <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>
                Interview Status
              </span>
              {isAIPlaying && <span className='text-sm font-semibold text-emerald-600'>
                {isAIPlaying ? "AI Speaking" : ""}
              </span>}
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className='flex justify-center'>
              <Timer timeLeft={timeLeft} totalTime={questions[currentIndex]?.timeLimit} />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className='grid grid-cols-2 gap-6 text-center'>
              <div>
                <span className='text-2xl font-bold text-emerald-600'>{currentIndex + 1}</span>
                <span className='text-xs text-gray-400'>Current Question</span>
              </div>

              <div>
                <span className='text-2xl font-bold text-emerald-600'>{questions.length}</span>
                <span className='text-xs text-gray-400'>Total Questions</span>
              </div>
            </div>

            {isCameraOn && webcamFeedback && (
              <div className='bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 text-center'>
                {webcamFeedback}
              </div>
            )}
          </div>
        </div>

        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>
          <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>
            AI Smart Interview
          </h2>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden mb-6"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!isIntroPhase && (
            <div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
              <p className='text-xs sm:text-sm text-gray-400 mb-2'>
                Question {currentIndex + 1} of {questions.length}
              </p>
              <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed '>{questions[currentIndex]?.question}</div>
            </div>
          )}

          {!isIntroPhase && (
            <div className='flex gap-3 mb-4'>
              <motion.button
                onClick={() => isCameraOn ? stopWebcam() : startWebcam()}
                className={`p-3 rounded-full ${isCameraOn ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                whileTap={{ scale: 0.9 }}
              >
                <FaVideo size={20} />
              </motion.button>
              {isCameraOn && (
                <div className='w-32 h-24 rounded-lg overflow-hidden border border-gray-300 relative'>
                  <video
                    ref={webcamRef}
                    className='w-full h-full object-cover'
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    className='absolute top-0 left-0 w-full h-full'
                  />
                </div>
              )}
            </div>
          )}

          <textarea
            placeholder="Type your answer here..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
          />

          {!feedback ? (
            <div className='flex items-center gap-4 mt-6'>
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg'
              >
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500 cursor-pointer'
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center space-x-2'>
                    <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    <span>Submitting...</span>
                  </div>
                ) : "Submit Answer"}
              </motion.button>

            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm'
            >
              <p className='text-emerald-700 font-medium mb-4'>{feedback}</p>

              <button
                onClick={handleNext}
                className='w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1'
              >
                {currentIndex + 1 >= questions.length ? "Finish Interview" : "Next Question"}
              </button>

            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InterviewSession