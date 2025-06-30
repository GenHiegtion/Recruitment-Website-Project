import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import checkRole from "../middlewares/checkRole.js";
import { deleteCompany, getAllCompanies, getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// Admin route - Lấy tất cả công ty trong hệ thống
router.route("/all").get(isAuthenticated, checkRole(['admin']), getAllCompanies);
// Cho phép cả admin và recruiter xóa công ty
router.route("/delete/:id").delete(isAuthenticated, checkRole(['admin', 'recruiter']), deleteCompany);

// Giới hạn chỉ recruiter mới được đăng ký và quản lý công ty
router.route("/register").post(isAuthenticated, checkRole(['recruiter']), registerCompany);
router.route("/get").get(isAuthenticated, checkRole(['recruiter']), getCompany);
// Cho phép cả admin và recruiter xem chi tiết công ty
router.route("/get/:id").get(isAuthenticated, checkRole(['recruiter', 'admin']), getCompanyById);
router.route("/update/:id").put(isAuthenticated, checkRole(['recruiter']), singleUpload, updateCompany);

export default router;