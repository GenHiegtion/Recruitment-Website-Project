import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import checkRole from "../middlewares/checkRole.js";
import { deleteJob, getAllJobsForAdmin, getAdminJobs, getAllJobs, getJobById, postJob, updateJob } from "../controllers/job.controller.js";

const router = express.Router();

// Chỉ recruiter mới được đăng tin tuyển dụng
router.route("/post").post(isAuthenticated, checkRole(['recruiter']), postJob);

// Cả applicant và recruiter đều được xem danh sách việc làm
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);

// Chỉ recruiter mới được xem danh sách việc làm đã đăng và quản lý chúng
router.route("/getadminjobs").get(isAuthenticated, checkRole(['recruiter']), getAdminJobs);
router.route("/update/:id").put(isAuthenticated, checkRole(['recruiter']), updateJob);
// Cho phép cả admin và recruiter xóa công việc
router.route("/delete/:id").delete(isAuthenticated, checkRole(['recruiter', 'admin']), deleteJob);

// Chỉ admin mới được xem tất cả job trong hệ thống
router.route("/get-all-jobs").get(isAuthenticated, checkRole(['admin']), getAllJobsForAdmin);

export default router;