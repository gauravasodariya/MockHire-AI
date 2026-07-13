import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BsCoin } from "react-icons/bs";
import { HiOutlineLightningBolt } from "react-icons/hi";

import { HiOutlineLogout, HiMenu, HiX } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { useAuth } from "../context/authContext";
import AuthModel from "./AuthModel";

function Navbar() {
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModel, setShowAuthModel] = useState(false);

  const userPopupRef = useRef(null);
  const creditPopupRef = useRef(null);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userPopupRef.current &&
        !userPopupRef.current.contains(event.target)
      ) {
        setShowUserPopup(false);
      }
      if (
        creditPopupRef.current &&
        !creditPopupRef.current.contains(event.target)
      ) {
        setShowCreditPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setError("");
      setSuccess("");
      await logout();
      setShowCreditPopup(false);
      setShowUserPopup(false);
      setSuccess("Logout successful!");
      setTimeout(() => {
        setSuccess("");
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Logout error:", err);
      setError(
        err.response?.data?.message || "Failed to logout. Please try again.",
      );
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="flex justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-6xl px-6 py-4 flex justify-between items-center relative"
        >
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              navigate("/");
              window.scrollTo(0, 0);
            }}
          >
            <img src="/4.png" alt="Logo" className="h-8 w-8 object-contain" />
            <h2 className="font-semibold hidden md:block text-lg text-emerald-800">
              MockHire AI
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`text-base font-medium transition relative cursor-pointer ${isActive(link.path) ? "text-emerald-700" : "text-gray-500 hover:text-emerald-600"}`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block" ref={creditPopupRef}>
              <button
                onClick={() => {
                  if (!user) {
                    setShowAuthModel(true);
                    return;
                  }
                  setShowCreditPopup(!showCreditPopup);
                  setShowUserPopup(false);
                }}
                className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full text-md hover:bg-emerald-100 transition cursor-pointer"
              >
                <BsCoin size={20} className="text-emerald-600" />
                <span className="font-semibold text-emerald-700">
                  {user?.credits || 0}
                </span>
              </button>
              <AnimatePresence>
                {showCreditPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-3 w-72 bg-white shadow-xl border border-emerald-100 rounded-xl p-5 z-50"
                  >
                    <p className="text-sm text-gray-600 mb-4">
                      Need more credits to continue interviews
                    </p>
                    <button
                      onClick={() => {
                        navigate("/pricing");
                        setShowCreditPopup(false);
                      }}
                      className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm hover:opacity-90 transition cursor-pointer font-semibold"
                    >
                      Buy more credits
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="relative" ref={userPopupRef}>
                <button
                  onClick={() => {
                    setShowUserPopup(!showUserPopup);
                    setShowCreditPopup(false);
                  }}
                  className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold cursor-pointer shadow-md hover:bg-emerald-700 transition"
                >
                  {user?.name ? (
                    user.name.slice(0, 1).toUpperCase()
                  ) : (
                    <FaUserAstronaut size={18} />
                  )}
                </button>
                <AnimatePresence>
                  {showUserPopup && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-3 w-64 bg-white shadow-xl border border-emerald-100 rounded-xl p-4 z-50"
                    >
                      <div className="border-b border-gray-100 pb-3 mb-3">
                        <p className="text-lg font-bold text-emerald-700">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/history");
                          setShowUserPopup(false);
                        }}
                        className="w-full text-left text-base py-2 px-3 rounded-lg text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer mb-1"
                      >
                        Interview History
                      </button>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => {
                            navigate("/admin");
                            setShowUserPopup(false);
                          }}
                          className="w-full text-left text-base py-2 px-3 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition cursor-pointer mb-1"
                        >
                          Admin Dashboard
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left text-base py-2 px-3 rounded-lg flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                      >
                        <HiOutlineLogout size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAuthModel(true)}
                  className="hidden md:block text-sm font-medium text-gray-600 hover:text-emerald-700 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => setShowAuthModel(true)}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-emerald-700 transition cursor-pointer shadow-md"
                >
                  Get Started
                </button>
              </div>
            )}

            <button
              className="md:hidden cursor-pointer"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? (
                <HiX size={28} className="text-emerald-700" />
              ) : (
                <HiMenu size={28} className="text-emerald-700" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl overflow-hidden md:hidden z-50"
              >
                <div className="p-6 flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => {
                        navigate(link.path);
                        setShowMobileMenu(false);
                      }}
                      className={`text-left text-base font-semibold py-2 px-3 rounded-lg cursor-pointer ${isActive(link.path) ? "text-emerald-700 bg-emerald-50" : "text-gray-500 hover:text-emerald-600 hover:bg-gray-50"}`}
                    >
                      {link.name}
                    </button>
                  ))}
                  {user && (
                    <>
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <BsCoin size={20} className="text-emerald-600" />
                        <span className="font-semibold text-emerald-700">
                          {user?.credits} Credits
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/history");
                          setShowMobileMenu(false);
                        }}
                        className="text-left text-base py-2 text-gray-600 hover:text-emerald-600 cursor-pointer"
                      >
                        Interview History
                      </button>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => {
                            navigate("/admin");
                            setShowMobileMenu(false);
                          }}
                          className="text-left text-base py-2 text-blue-600 cursor-pointer"
                        >
                          Admin Dashboard
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="text-left text-base py-2 text-red-500 cursor-pointer"
                      >
                        Logout
                      </button>
                    </>
                  )}
                  {!user && (
                    <button
                      onClick={() => {
                        setShowAuthModel(true);
                        setShowMobileMenu(false);
                      }}
                      className="bg-emerald-600 text-white py-3 rounded-lg text-base font-semibold shadow-md cursor-pointer hover:bg-emerald-700"
                    >
                      Get Started
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="absolute top-full left-0 right-0 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden mt-2 mx-6"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="absolute top-full left-0 right-0 bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden mt-2 mx-6"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {showAuthModel && <AuthModel onClose={() => setShowAuthModel(false)} />}
    </nav>
  );
}
export default Navbar;
