import express from "express";
import { submitContact, getAllContacts } from "../controllers/contact.js";
import isAuth from "../middleware/isAuth.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.post("/", submitContact);
router.get("/", isAuth, isAdmin, getAllContacts);

export default router;