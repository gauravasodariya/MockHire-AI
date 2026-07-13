import jwt from "jsonwebtoken";

export const generateToken = async (userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRETKEY, { expiresIn: "30d" });
    return token;
  } catch (error) {
    console.log(error);
    throw new Error("Token generation failed");
  }
};
