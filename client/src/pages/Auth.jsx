import React, { useState, useEffect } from "react";
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { serverUrl } from "../App";
import { auth, provider } from "../utils/firebase";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

function Auth({ isModel = false, onClose }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth, user } = useAuth();
  const navigate = useNavigate();

  // When user logs in (via popup or redirect), show success and navigate
  useEffect(() => {
    if (user) {
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        if (isModel && onClose) onClose();
        navigate("/");
      }, 1500);
    }
  }, [user, isModel, onClose, navigate]);

  const handleGoogleAuth = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      console.log("Starting Google sign in...");
      let response;
      try {
        response = await signInWithPopup(auth, provider);
      } catch (popupErr) {
        // If popup is blocked, try redirect
        if (popupErr.code === "auth/popup-blocked" || popupErr.code === "auth/cancelled-popup-request") {
          console.log("Popup blocked or cancelled, falling back to redirect");
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }

      console.log("Firebase sign in successful", response.user);
      const user = response.user;
      const name = user.displayName;
      const email = user.email;
      console.log("Sending to backend...", { name, email });
      const result = await axios.post(
        serverUrl + "/api/auth/google",
        { name, email },
      );
      console.log("Backend response successful", result.data);
      // Backend returns { user, token }
      setAuth(result.data.user, result.data.token);
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        if (isModel && onClose) onClose();
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Google auth error:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        response: err.response?.data,
      });
      let errorMessage = "Google authentication failed. Please try again.";

      // Firebase specific errors
      if (err.code) {
        if (err.code === "auth/unauthorized-domain") {
          errorMessage =
            "This domain is not authorized for Google sign-in. Please contact support.";
        } else if (err.code === "auth/popup-closed-by-user") {
          errorMessage = "Sign-in popup was closed. Please try again.";
        } else {
          errorMessage = err.message || errorMessage;
        }
      } else if (err.response?.data?.message) {
        // Backend errors
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`w-full flex items-center justify-center px-6 py-20 ${isModel ? "" : "min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50"}`}
    >
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05 }}
        className={`w-full relative
            ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"}
            rounded-3xl bg-white shadow-2xl border border-gray-200`}
      >
        {isModel && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-700 hover:text-black cursor-pointer"
          >
            <FaTimes size={18} />
          </button>
        )}
        <div className="flex items-center justify-center gap-3 mb-6 cursor-pointer">
          <div className="bg-emerald-600 text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h2 className="text-lg font-semibold text-emerald-800">
            MockHire AI
          </h2>
        </div>

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
          {success && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden mb-6"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className="text-2xl md:text-3xl font-semibold text-center leading-snug mb-4">
          Continue with
          <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full inline-flex items-center gap-2">
            <IoSparkles size={16} />
            AI Smart Interview
          </span>
        </h1>

        <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8">
          Sign in to start AI-powered mock interviews, track your progress, and
          unlock detailed performance insights.
        </p>
        <motion.button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 bg-gray-600 text-white rounded-full shadow-md cursor-pointer disabled:opacity-50 hover:bg-gray-700"
          whileHover={!loading ? { opacity: 0.9, scale: 1.03 } : {}}
          whileTap={!loading ? { opacity: 1, scale: 0.98 } : {}}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            <>
              <FcGoogle size={20} />
              Sign in with Google
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
export default Auth;
