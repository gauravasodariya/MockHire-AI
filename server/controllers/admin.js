import mongoose from "mongoose";
import User from "../models/user.js";
import Contact from "../models/contact.js";
import Payment from "../models/payment.js";
import Interview from "../models/interview.js";
import Plan from "../models/plan.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalContacts = await Contact.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, sum: { $sum: "$amount" } } }
    ]);
    const totalInterviews = await Interview.countDocuments();

    res.json({
      totalUsers,
      totalContacts,
      totalRevenue: totalRevenue[0]?.sum || 0,
      totalInterviews
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["candidate", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateContactStatus = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status } = req.body;

    if (!["new", "in_progress", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const contact = await Contact.findByIdAndUpdate(contactId, { status }, { new: true });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(contact);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Plan CRUD
export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ order: 1, createdAt: -1 });
    res.json(plans);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { name, price, credits, description, features, badge, isDefault, order } = req.body;
    const newPlan = new Plan({ name, price, credits, description, features, badge, isDefault, order });
    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updatedPlan = await Plan.findByIdAndUpdate(planId, req.body, { new: true });
    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json(updatedPlan);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const deletedPlan = await Plan.findByIdAndDelete(planId);
    if (!deletedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};