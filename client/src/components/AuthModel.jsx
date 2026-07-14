import React from "react";
import Auth from "../pages/Auth";
import { motion, AnimatePresence } from "framer-motion";

function AuthModel({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[900] flex items-center justify-center bg-black/10 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="w-full max-w-md"
        >
          <Auth isModel={true} onClose={onClose} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
export default AuthModel;
