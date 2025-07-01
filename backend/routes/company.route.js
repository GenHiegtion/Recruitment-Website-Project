import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import checkRole from "../middlewares/checkRole.js";
import { deleteCompany, getAllCompanies, getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// Admin route - Get all companies in the system
router.route("/all").get(isAuthenticated, checkRole(['admin']), getAllCompanies);
// Allow both admin and recruiter to delete companies
router.route("/delete/:id").delete(isAuthenticated, checkRole(['admin', 'recruiter']), deleteCompany);

// Restrict only recruiter to register and manage companies
router.route("/register").post(isAuthenticated, checkRole(['recruiter']), registerCompany);
router.route("/get").get(isAuthenticated, checkRole(['recruiter']), getCompany);
// Allow both admin and recruiter to view company details
router.route("/get/:id").get(isAuthenticated, checkRole(['recruiter', 'admin']), getCompanyById);
router.route("/update/:id").put(isAuthenticated, checkRole(['recruiter']), singleUpload, updateCompany);

export default router;