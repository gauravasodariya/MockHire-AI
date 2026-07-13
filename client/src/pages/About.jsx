import React from "react";
import { motion } from "framer-motion";
import {
  BsRobot,
  BsBarChart,
  BsMic,
  BsFileEarmarkText,
  BsCheckCircle,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { FaUsers, FaUserTie, FaHeart } from "react-icons/fa";

function About() {
  const features = [
    {
      icon: <BsRobot size={26} />,
      title: "AI-Powered Interviews",
      desc: "Our advanced AI simulates real interview scenarios with adaptive difficulty based on your role and experience level.",
    },
    {
      icon: <BsMic size={26} />,
      title: "Voice Recognition",
      desc: "Practice speaking your answers out loud just like a real interview, with our voice-input technology.",
    },
    {
      icon: <BsBarChart size={26} />,
      title: "Detailed Analytics",
      desc: "Get comprehensive feedback on your communication skills, confidence, and answer accuracy.",
    },
    {
      icon: <BsFileEarmarkText size={26} />,
      title: "Resume Integration",
      desc: "Upload your resume and get custom-tailored questions based on your experience and projects.",
    },
  ];

  const values = [
    "Accessibility: Making quality interview prep available to everyone",
    "Innovation: Constantly improving our AI technology",
    "Empathy: Understanding the stress of job interviews",
    "Excellence: Delivering accurate and valuable feedback",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 px-4 sm:px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-50 text-emerald-700 text-sm px-5 py-2 rounded-full flex items-center gap-2 font-semibold border border-emerald-100">
              <HiSparkles size={18} />
              About Us
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-emerald-800">
            Revolutionizing Interview Preparation
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            MockHire AI is on a mission to help everyone ace their interviews
            with confidence. Our AI-powered platform provides realistic
            practice, instant feedback, and actionable insights.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="bg-emerald-50 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-emerald-800">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Our Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-3 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100">
                <FaHeart size={20} className="text-emerald-600" />
                <span className="text-emerald-700 font-semibold">
                  Our Values
                </span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-emerald-800">
              What We Stand For
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                className="bg-white border border-emerald-100 rounded-2xl p-6 flex items-start gap-4"
              >
                <div className="mt-1 flex-shrink-0">
                  <BsCheckCircle className="text-emerald-500 text-xl" />
                </div>
                <p className="text-gray-700 font-medium">{value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white border border-emerald-100 rounded-3xl p-10 text-center shadow-sm"
        >
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-3 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100">
              <FaUsers size={20} className="text-emerald-600" />
              <span className="text-emerald-700 font-semibold">
                Our Journey
              </span>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-emerald-800">
            Our Story
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-lg">
            Founded by a team of engineers and recruiters, MockHire AI was born
            out of a simple idea: everyone deserves access to high-quality
            interview practice. We believe that with the right tools, anyone can
            overcome interview anxiety and showcase their true potential.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default About;
