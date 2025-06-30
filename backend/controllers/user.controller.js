import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Job } from "../models/job.model.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        
        let profilePhotoUrl = null;
        
        // Kiểm tra xem có file được gửi hay không
        if (req.file) {
            const file = req.file;
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhotoUrl = cloudResponse.secure_url;
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhotoUrl,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An error occurred during registration",
            error: error.message,
            success: false
        });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { 
            maxAge: 1 * 24 * 60 * 60 * 1000, 
            httpOnly: true, 
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An error occurred during login",
            error: error.message,
            success: false
        });
    }
}

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { 
            maxAge: 0, 
            httpOnly: true, 
            sameSite: 'lax' 
        }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An error occurred during logout",
            error: error.message,
            success: false
        });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;

        let cloudResponse = null;
        // Kiểm tra xem có file được gửi hay không
        if (req.file) {
            const file = req.file;
            // cloudinary connecting
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }
        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }
        // updating data
        if (fullname) user.fullname = fullname
        if (email) user.email = email
        if (phoneNumber) user.phoneNumber = phoneNumber
        if (bio) user.profile.bio = bio
        if (skills) user.profile.skills = skillsArray

        // Handle file upload based on user role
        if (cloudResponse) {
            if (user.role === 'admin') {
                // For admin, update profile photo
                user.profile.profilePhoto = cloudResponse.secure_url;
            } else {
                // For other roles (applicant, recruiter), update resume
                user.profile.resume = cloudResponse.secure_url;
                user.profile.resumeOriginalName = req.file.originalname;
            }
        }

        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message: "Profile updated successfully.",
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An error occurred during profile update",
            error: error.message,
            success: false
        });
    }
}

export const saveJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Check if job is already saved
        if (user.savedJobs && user.savedJobs.includes(jobId)) {
            return res.status(400).json({
                message: "Job already saved",
                success: false
            });
        }

        // Add job to savedJobs array
        user.savedJobs = user.savedJobs || [];
        user.savedJobs.push(jobId);
        
        await user.save();

        return res.status(200).json({
            message: "Job saved successfully",
            success: true
        });
    } catch (error) {
        console.log(`Error saving job: ${error.message}`);
        return res.status(500).json({
            message: "Error saving job",
            success: false
        });
    }
}

export const unsaveJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Check if job exists in savedJobs
        if (!user.savedJobs || !user.savedJobs.some(id => id.toString() === jobId)) {
            return res.status(400).json({
                message: "Job not found in saved jobs",
                success: false
            });
        }

        // Remove job from savedJobs array
        user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
        
        await user.save();

        return res.status(200).json({
            message: "Removed from saved jobs",
            success: true
        });
    } catch (error) {
        console.log(`Error unsaving job: ${error.message}`);
        return res.status(500).json({
            message: "Error removing saved job",
            success: false
        });
    }
}

export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.id;

        // Find user and populate savedJobs
        const user = await User.findById(userId).populate({
            path: 'savedJobs',
            populate: {
                path: 'company'
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        const savedJobs = user.savedJobs || [];
        const count = savedJobs.length;

        return res.status(200).json({
            savedJobs,
            count,
            success: true
        });
    } catch (error) {
        console.log(`Error getting saved jobs: ${error.message}`);
        return res.status(500).json({
            message: "Error getting saved jobs",
            success: false
        });
    }
}

// Hàm dọn dẹp savedJobs - loại bỏ các job ID không còn tồn tại
export const cleanUpSavedJobs = async (req, res) => {
    try {
        const userId = req.id;
        
        // Tìm user cần xử lý
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        // Không có savedJobs để xử lý
        if (!user.savedJobs || user.savedJobs.length === 0) {
            return res.status(200).json({
                message: "No saved jobs to clean up",
                success: true,
                jobsRemoved: 0
            });
        }
        
        const savedJobsBeforeCleanup = [...user.savedJobs];
        const validJobIds = [];
        
        // Kiểm tra từng job ID xem còn tồn tại không
        for (const jobId of user.savedJobs) {
            const jobExists = await Job.exists({ _id: jobId });
            if (jobExists) {
                validJobIds.push(jobId);
            }
        }
        
        // Cập nhật lại mảng savedJobs chỉ với các ID hợp lệ
        user.savedJobs = validJobIds;
        await user.save();
        
        const jobsRemoved = savedJobsBeforeCleanup.length - validJobIds.length;
        
        return res.status(200).json({
            message: `Cleaned up saved jobs. Removed ${jobsRemoved} invalid references.`,
            success: true,
            jobsRemoved,
            currentSavedJobs: validJobIds.length
        });
    } catch (error) {
        console.log(`Error cleaning up saved jobs: ${error.message}`);
        return res.status(500).json({
            message: "Error cleaning up saved jobs",
            error: error.message,
            success: false
        });
    }
}

/**
 * Lấy danh sách tất cả người dùng (chỉ applicant và recruiter)
 * Admin endpoint - chỉ dành cho quản trị viên
 */
export const getAllUsers = async (req, res) => {
    try {
        // Có thể thêm tham số query để lọc theo vai trò hoặc tìm kiếm theo tên
        const { role, search, page = 1, limit = 10 } = req.query;
        
        // Xây dựng query để tìm kiếm
        let query = {
            // Loại bỏ người dùng có vai trò admin khỏi kết quả
            role: { $ne: 'admin' }
        };
        
        // Lọc theo vai trò nếu có yêu cầu
        if (role && role !== 'all') {
            query.role = role;
        }
        
        // Tìm kiếm theo tên nếu có
        if (search) {
            query.fullname = { $regex: search, $options: "i" };
        }
        
        // Đếm tổng số document thỏa mãn điều kiện
        const total = await User.countDocuments(query);
        
        // Tính toán skip để phân trang
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        
        // Thực hiện truy vấn lấy người dùng với phân trang
        const users = await User.find(query)
            .select("-password") // Loại bỏ trường password cho bảo mật
            .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo, mới nhất trước
            .skip(skip)
            .limit(pageSize);
        
        return res.status(200).json({
            message: "Successfully get users list",
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize)
            },
            users,
            success: true
        });
    } catch (error) {
        console.log(`Error getting all users: ${error.message}`);
        return res.status(500).json({
            message: "Fail to get users list",
            error: error.message,
            success: false
        });
    }
}

/**
 * Lấy danh sách tất cả người dùng không phân trang
 * Admin endpoint - chỉ dành cho quản trị viên
 */
export const getAllUsersNoPage = async (req, res) => {
    try {
        // Có thể thêm tham số query để lọc theo vai trò hoặc tìm kiếm theo tên
        const { role, search } = req.query;
        
        // Xây dựng query để tìm kiếm
        let query = {
            // Loại bỏ người dùng có vai trò admin khỏi kết quả
            role: { $ne: 'admin' }
        };
        
        // Lọc theo vai trò nếu có yêu cầu
        if (role && role !== 'all') {
            query.role = role;
        }
        
        // Tìm kiếm theo tên nếu có
        if (search) {
            query.fullname = { $regex: search, $options: "i" };
        }
        
        // Lấy tất cả người dùng không phân trang
        const users = await User.find(query)
            .select("-password") // Loại bỏ trường password cho bảo mật
            .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo, mới nhất trước
        
        return res.status(200).json({
            message: "Successfully get all users",
            count: users.length,
            users,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error fetching users: " + error.message,
            success: false
        });
    }
}

/**
 * Tạo tài khoản admin mới
 * API này được bảo vệ bằng một secret key
 */
export const createAdmin = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, secretKey } = req.body;
        
        // Kiểm tra secret key để tạo admin
        // Sử dụng giá trị từ biến môi trường hoặc một giá trị mặc định nếu không có
        const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "recruitment_system_admin_secret2025";
        
        if (!secretKey || secretKey !== ADMIN_SECRET_KEY) {
            return res.status(403).json({
                message: "Not enough authorization to create admin account",
                success: false
            });
        }

        if (!fullname || !email || !phoneNumber || !password) {
            return res.status(400).json({
                message: "Please enter full information",
                success: false
            });
        }
        
        // Kiểm tra email đã tồn tại chưa
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'Used email',
                success: false,
            });
        }
        
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo tài khoản admin mới
        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role: 'admin',
            profile: {
                profilePhoto: "",
            }
        });

        return res.status(201).json({
            message: "Admin account successfully created",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Admin account creation failed",
            error: error.message,
            success: false
        });
    }
}

/**
 * Xóa người dùng và tất cả dữ liệu liên quan
 * Admin endpoint - chỉ dành cho quản trị viên
 */
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Tìm user cần xóa
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        // Không cho phép xóa tài khoản admin
        if (userToDelete.role === 'admin') {
            return res.status(403).json({
                message: "Cannot delete admin accounts",
                success: false
            });
        }
        
        // Thống kê dữ liệu đã xóa để trả về
        const deletedData = {
            companies: 0,
            jobs: 0,
            applications: 0
        };

        // Import các model cần thiết
        const { Company } = await import("../models/company.model.js");
        const { Job } = await import("../models/job.model.js");
        const { Application } = await import("../models/application.model.js");
        
        // Xử lý dựa trên vai trò của user
        if (userToDelete.role === 'recruiter') {
            // 1. Tìm tất cả công ty được tạo bởi recruiter này
            const companies = await Company.find({ userId: userId });
            deletedData.companies = companies.length;
            
            // 2. Tìm và xóa tất cả job thuộc các công ty này
            for (const company of companies) {
                const jobs = await Job.find({ company: company._id });
                deletedData.jobs += jobs.length;
                
                // 3. Xóa tất cả application cho các job này
                for (const job of jobs) {
                    const applications = await Application.deleteMany({ job: job._id });
                    deletedData.applications += applications.deletedCount;
                }
                
                // 4. Xóa tất cả job của công ty
                await Job.deleteMany({ company: company._id });
            }
            
            // 5. Xóa tất cả công ty của recruiter
            await Company.deleteMany({ userId: userId });
            
        } else if (userToDelete.role === 'applicant') {
            // 1. Tìm và xóa tất cả application của applicant
            const applications = await Application.deleteMany({ applicant: userId });
            deletedData.applications = applications.deletedCount;
        }
        
        // Xóa user
        await User.findByIdAndDelete(userId);
        
        return res.status(200).json({
            message: "User and related data deleted successfully",
            deletedData,
            success: true
        });
    } catch (error) {
        console.log(`Error deleting user: ${error.message}`);
        return res.status(500).json({
            message: "Failed to delete user",
            error: error.message,
            success: false
        });
    }
}

/**
 * Lấy danh sách tất cả người dùng có vai trò applicant
 * Admin endpoint - chỉ dành cho quản trị viên
 */
export const getAllApplicants = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        
        // Xây dựng query để tìm kiếm applicant
        let query = {
            role: 'applicant' // Chỉ lấy người dùng có vai trò applicant
        };
        
        // Tìm kiếm theo tên nếu có
        if (search) {
            query.fullname = { $regex: search, $options: "i" };
        }
        
        // Đếm tổng số applicant thỏa mãn điều kiện
        const total = await User.countDocuments(query);
        
        // Tính toán skip để phân trang
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        
        // Thực hiện truy vấn lấy danh sách applicant với phân trang
        const applicants = await User.find(query)
            .select("-password") // Loại bỏ trường password cho bảo mật
            .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo, mới nhất trước
            .skip(skip)
            .limit(pageSize);
        
        return res.status(200).json({
            message: "Get applicants list successfully",
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize)
            },
            applicants,
            success: true
        });
    } catch (error) {
        console.log(`Fail to get applicants list: ${error.message}`);
        return res.status(500).json({
            message: "Unable to get applicants list",
            error: error.message,
            success: false
        });
    }
}

/**
 * Lấy danh sách tất cả người dùng có vai trò recruiter
 * Admin endpoint - chỉ dành cho quản trị viên
 */
export const getAllRecruiters = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        
        // Xây dựng query để tìm kiếm recruiter
        let query = {
            role: 'recruiter' // Chỉ lấy người dùng có vai trò recruiter
        };
        
        // Tìm kiếm theo tên nếu có
        if (search) {
            query.fullname = { $regex: search, $options: "i" };
        }
        
        // Đếm tổng số recruiter thỏa mãn điều kiện
        const total = await User.countDocuments(query);
        
        // Tính toán skip để phân trang
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        
        // Thực hiện truy vấn lấy danh sách recruiter với phân trang
        const recruiters = await User.find(query)
            .select("-password") // Loại bỏ trường password cho bảo mật
            .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo, mới nhất trước
            .skip(skip)
            .limit(pageSize);
        
        return res.status(200).json({
            message: "Get recruiters list successfully",
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize)
            },
            recruiters,
            success: true
        });
    } catch (error) {
        console.log(`Fail to get recruiters list: ${error.message}`);
        return res.status(500).json({
            message: "Unable to get recruiters list",
            error: error.message,
            success: false
        });
    }
}