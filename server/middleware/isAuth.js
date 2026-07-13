import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
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
