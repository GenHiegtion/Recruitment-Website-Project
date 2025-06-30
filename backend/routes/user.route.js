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

// API lấy tất cả user với phân trang - chỉ cho phép admin truy cập
router.route("/all").get(isAuthenticated, checkRole(['admin']), getAllUsers);

// API lấy tất cả user không phân trang - chỉ cho phép admin truy cập
router.route("/all-no-page").get(isAuthenticated, checkRole(['admin']), getAllUsersNoPage);

// API lấy tất cả applicant với phân trang - chỉ cho phép admin truy cập
router.route("/applicants").get(isAuthenticated, checkRole(['admin']), getAllApplicants);

// API lấy tất cả recruiter với phân trang - chỉ cho phép admin truy cập
router.route("/recruiters").get(isAuthenticated, checkRole(['admin']), getAllRecruiters);

// API để tạo tài khoản admin (được bảo vệ bằng secret key)
router.route("/create-admin").post(createAdmin);

// API xóa user và tất cả dữ liệu liên quan - chỉ cho phép admin truy cập
router.route("/delete/:id").delete(isAuthenticated, checkRole(['admin']), deleteUser);

export default router;