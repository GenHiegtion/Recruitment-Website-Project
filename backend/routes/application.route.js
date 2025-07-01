import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import checkRole from "../middlewares/checkRole.js";
import { applyJob, cancelApplication, getApplicants, getAppliedJobs, updateStatus }
        from "../controllers/application.controller.js";

const router = express.Router();

// Only applicants can submit job applications
router.route("/apply/:id").get(isAuthenticated, checkRole(['applicant']), applyJob);
// Only applicant can cancel applications
router.route("/cancel/:id").delete(isAuthenticated, checkRole(['applicant']), cancelApplication);
// Applicant views jobs they've applied to
router.route("/get").get(isAuthenticated, getAppliedJobs);
// Only recruiter can view the list of applicants
router.route("/:id/applicants").get(isAuthenticated, checkRole(['recruiter']), getApplicants);
// Only recruiter can update application status
router.route("/status/:id/update").post(isAuthenticated, checkRole(['recruiter']), updateStatus);

export default router;