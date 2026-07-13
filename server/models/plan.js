import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  credits: { type: Number, required: true, default: 0 },
  description: { type: String },
  features: [{ type: String }],
  badge: { type: String },
  order: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Plan", planSchema);
