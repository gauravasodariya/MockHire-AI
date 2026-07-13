import mongoose from "mongoose";
import Plan from "../models/plan.js";

// Public: Get all plans
export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ order: 1, createdAt: -1 });
    res.json(plans);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Optional: Get single plan by ID
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json(plan);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
