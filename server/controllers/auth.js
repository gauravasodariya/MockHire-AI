import User from "../models/user.js";
import { generateToken } from "../utils/token.js";

export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email || !name) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
      });
    }
    const token = await generateToken(user._id);
    // Return token and user in response body instead of setting cookie
    return res.status(200).json({ user, token });
  } catch (error) {
    console.error("Google auth error:", error);
    return res
      .status(500)
      .json({
        message: "Google authentication failed. Please try again later." });
  }
};

export const logout = async (req, res) => {
  try {
    // No cookie to clear—just send success response
    return res.status(200).json({ message: "Logout Successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res
      .status(500)
      .json({ message: "Logout failed. Please try again later." });
  }
};
