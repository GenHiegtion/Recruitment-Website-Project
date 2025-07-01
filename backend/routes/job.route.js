import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import checkRole from "../middlewares/checkRole.js";
import { deleteJob, getAllJobsForAdmin, getAdminJobs, getAllJobs, getJobById, postJob, updateJob } from "../controllers/job.controller.js";

const router = express.Router();

// Only recruiters can post job listings
router.route("/post").post(isAuthenticated, checkRole(['recruiter']), postJob);

// Both applicant and recruiter can view job listings
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);

// Only recruiter can view and manage their posted job listings
router.route("/getadminjobs").get(isAuthenticated, checkRole(['recruiter']), getAdminJobs);
router.route("/update/:id").put(isAuthenticated, checkRole(['recruiter']), updateJob);
// Allow both admin and recruiter to delete jobs
router.route("/delete/:id").delete(isAuthenticated, checkRole(['recruiter', 'admin']), deleteJob);

// Only admins can view all jobs in the system
router.route("/get-all-jobs").get(isAuthenticated, checkRole(['admin']), getAllJobsForAdmin);

export default router;