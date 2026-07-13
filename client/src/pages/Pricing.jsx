import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { serverUrl } from "../App";
import { useAuth } from "../context/authContext";
function Pricing() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const { setUser } = useAuth();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(serverUrl + "/api/plans");
        setPlans(res.data);
        const defaultPlan = res.data.find(p => p.isDefault) || res.data[0];
        if (defaultPlan) setSelectedPlan(defaultPlan._id);
      } catch (err) {
        setError("Failed to load plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePayment = async (plan) => {
    setError("");
    setSuccess("");
    try {
      setLoadingPlan(plan._id);
      const amount = plan.price;

      const result = await axios.post(
        serverUrl + "/api/payment/order",
        {
          planId: plan._id,
          amount: amount,
          credits: plan.credits,
        },
        { withCredentials: true },
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: result.data.amount,
        currency: "INR",
        name: "MockHire AI",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,

        handler: async function (response) {
          try {
            const verifypay = await axios.post(
              serverUrl + "/api/payment/verify",
              response,
              { withCredentials: true },
            );
            setUser(verifypay.data.user);
            setSuccess("Payment Successful! Credits Added.");
            setTimeout(() => {
              navigate("/");
            }, 1500);
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. Please contact support if amount was deducted.",
            );
          }
        },
        theme: {
          color: "#10b981",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      setLoadingPlan(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to start payment. Please try again.",
      );
      setLoadingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-lg font-semibold text-emerald-800">
            Loading plans...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 px-4 sm:px-6 py-12">
      <div className="max-w-6xl mx-auto mb-14 flex items-start gap-4">
        <button
          onClick={() => navigate("/")}
          className="mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>

        <div className="text-center w-full">
          <h1 className="text-4xl font-bold text-gray-800">Choose Your Plan</h1>
          <p className="text-gray-500 mt-3 text-lg">
            Flexible pricing to match your interview preparation goals.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden mb-6 max-w-6xl mx-auto"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden mb-6 max-w-6xl mx-auto"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan._id;
          const isFree = plan.price === 0;

          return (
            <motion.div
              key={plan._id}
              whileHover={!isFree && { scale: 1.03 }}
              onClick={() => !isFree && setSelectedPlan(plan._id)}
              className={`relative rounded-3xl p-8 transition-all duration-300 border 
                ${
                  isSelected
                    ? "border-emerald-600 shadow-2xl bg-white"
                    : "border-gray-200 bg-white shadow-md"
                }
                ${isFree ? "cursor-default" : "cursor-pointer"}
              `}
            >
              {plan.badge && (
                <div className="absolute top-6 right-6 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow">
                  {plan.badge}
                </div>
              )}

              {plan.isDefault && (
                <div className="absolute top-6 right-6 bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                  Default
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-800">
                {plan.name}
              </h3>
              <div className="mt-4">
                <span className="text-3xl font-bold text-emerald-600">
                  ₹{plan.price}
                </span>
                <p className="text-gray-500 mt-1">{plan.credits} Credits</p>
              </div>

              <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                {plan.description}
              </p>

              <div className="mt-6 space-y-3 text-left">
                {plan.features?.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-500 text-sm" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {!isFree && (
                <button
                  disabled={loadingPlan === plan._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      setSelectedPlan(plan._id);
                    } else {
                      handlePayment(plan);
                    }
                  }}
                  className={`w-full mt-8 py-3 rounded-xl font-semibold transition ${
                    isSelected
                      ? "bg-emerald-600 text-white hover:opacity-90 cursor-pointer"
                      : "bg-gray-100 text-gray-700 hover:bg-emerald-50 cursor-pointer"
                  }`}
                >
                  {loadingPlan === plan._id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : isSelected ? (
                    "Proceed to Pay"
                  ) : (
                    "Select Plan"
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default Pricing;
