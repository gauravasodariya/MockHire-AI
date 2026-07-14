import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header (format: "Bearer <token>")
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    const verifyToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    if (!verifyToken) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
export default isAuth;
