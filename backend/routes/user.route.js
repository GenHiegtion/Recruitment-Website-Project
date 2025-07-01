import express from "express";
import { login, logout, register, updateProfile, saveJob, unsaveJob, getSavedJobs, cleanUpSavedJobs, getAllUsers, getAllUsersNoPage, createAdmin, deleteUser, getAllApplicants, getAllRecruiters } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import checkRole from "../middlewares/checkRole.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile);
router.route("/job/:id/save").post(isAuthenticated, saveJob);
router.route("/job/:id/unsave").post(isAuthenticated, unsaveJob);
router.route("/saved-jobs").get(isAuthenticated, getSavedJobs);
router.route("/cleanup-saved-jobs").post(isAuthenticated, cleanUpSavedJobs);

// API to get all users with pagination - only allows admin access
router.route("/all").get(isAuthenticated, checkRole(['admin']), getAllUsers);

// API to get all users without pagination - only allows admin access
router.route("/all-no-page").get(isAuthenticated, checkRole(['admin']), getAllUsersNoPage);

// API to get all applicants with pagination - only allows admin access
router.route("/applicants").get(isAuthenticated, checkRole(['admin']), getAllApplicants);

// API to get all recruiters with pagination - only allows admin access
router.route("/recruiters").get(isAuthenticated, checkRole(['admin']), getAllRecruiters);

// API to create admin account (protected by secret key)
router.route("/create-admin").post(createAdmin);

// API to delete user and all related data - only allows admin access
router.route("/delete/:id").delete(isAuthenticated, checkRole(['admin']), deleteUser);

export default router;