import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import checkRole from "../middlewares/checkRole.js";
import { applyJob, cancelApplication, getApplicants, getAppliedJobs, updateStatus }
        from "../controllers/application.controller.js";

const router = express.Router();

// Chỉ applicant mới được nộp đơn ứng tuyển
router.route("/apply/:id").get(isAuthenticated, checkRole(['applicant']), applyJob);
// Chỉ applicant mới được hủy đơn ứng tuyển
router.route("/cancel/:id").delete(isAuthenticated, checkRole(['applicant']), cancelApplication);
// Applicant xem công việc đã ứng tuyển
router.route("/get").get(isAuthenticated, getAppliedJobs);
// Chỉ recruiter mới được xem danh sách ứng viên
router.route("/:id/applicants").get(isAuthenticated, checkRole(['recruiter']), getApplicants);
// Chỉ recruiter mới được cập nhật trạng thái ứng tuyển
router.route("/status/:id/update").post(isAuthenticated, checkRole(['recruiter']), updateStatus);

export default router;