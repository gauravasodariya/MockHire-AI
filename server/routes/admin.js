import express from "express";
import isAuth from "../middleware/isAuth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  updateContactStatus,
  getAllPayments,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan
} from "../controllers/admin.js";
import { getAllContacts } from "../controllers/contact.js";

const router = express.Router();

router.get("/stats", isAuth, isAdmin, getDashboardStats);
router.get("/contacts", isAuth, isAdmin, getAllContacts);
router.get("/users", isAuth, isAdmin, getAllUsers);
router.get("/payments", isAuth, isAdmin, getAllPayments);
router.get("/plans", isAuth, isAdmin, getAllPlans);
router.post("/plans", isAuth, isAdmin, createPlan);
router.patch("/users/:userId/role", isAuth, isAdmin, updateUserRole);
router.patch("/contacts/:contactId/status", isAuth, isAdmin, updateContactStatus);
router.patch("/plans/:planId", isAuth, isAdmin, updatePlan);
router.delete("/plans/:planId", isAuth, isAdmin, deletePlan);

export default router;