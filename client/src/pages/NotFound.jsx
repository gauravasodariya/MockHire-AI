import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsRobot } from "react-icons/bs";
import { FaHome } from "react-icons/fa";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg p-12 rounded-[32px] bg-white shadow-2xl border border-gray-200 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-emerald-600 text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h2 className="text-lg font-semibold text-emerald-800">
            MockHire AI
          </h2>
        </div>

        <h1 className="text-8xl font-bold text-emerald-600 mb-6">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-10 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <motion.button
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-3 mx-auto py-3 px-8 bg-emerald-600 text-white rounded-full shadow-md cursor-pointer hover:bg-emerald-700 transition"
          whileHover={{ opacity: 0.9, scale: 1.03 }}
          whileTap={{ opacity: 1, scale: 0.98 }}
        >
          <FaHome size={16} />
          Go Back Home
        </motion.button>
      </motion.div>
    </div>
  );
}

export default NotFound;
