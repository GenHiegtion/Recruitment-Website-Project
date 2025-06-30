import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required.",
                success: false
            });
        }
        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({
                message: "You can't register same company.",
                success: false
            })
        };
        company = await Company.create({
            name: companyName,
            userId: req.id
        });

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getCompany = async (req, res) => {
    try {
        const userId = req.id; // logged in user id
        const companies = await Company.find({ userId });
        if (!companies) {
            return res.status(404).json({
                message: "Companies not found.",
                success: false
            })
        }
        return res.status(200).json({
            companies,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

// get company by id
export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }
        return res.status(200).json({
            company,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        
        // Khởi tạo object updateData với thông tin cơ bản
        const updateData = { 
            name, 
            description, 
            website, 
            location 
        };

        // Chỉ xử lý file khi có file được gửi lên
        if (req.file) {
            const file = req.file;
            // cloudinary connecting
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            updateData.logo = cloudResponse.secure_url;
        }

        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }
        
        return res.status(200).json({
            message: "Company information updated.",
            company, // Thêm company vào response để frontend dễ dàng cập nhật UI
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error updating company information",
            error: error.message,
            success: false
        });
    }
}

/**
 * Lấy tất cả công ty trong hệ thống
 * Admin endpoint - chỉ dành cho quản trị viên
 */
export const getAllCompanies = async (req, res) => {
    try {
        const { search } = req.query;
        
        // Xây dựng query để tìm kiếm
        let query = {};
        
        // Tìm kiếm theo tên nếu có
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        
        // Thực hiện truy vấn lấy tất cả công ty
        const companies = await Company.find(query)
            .populate('userId', 'fullname email') // Lấy thông tin người dùng đã tạo công ty
            .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo, mới nhất trước
        
        return res.status(200).json({
            message: "Get companies list successfully",
            count: companies.length,
            companies,
            success: true
        });
    } catch (error) {
        console.log(`Error getting all companies: ${error.message}`);
        return res.status(500).json({
            message: "Fail to get companies list",
            error: error.message,
            success: false
        });
    }
}

/**
 * Xóa công ty và tất cả công việc liên quan
 * Admin endpoint - chỉ dành cho quản trị viên
 */
export const deleteCompany = async (req, res) => {    try {
        const companyId = req.params.id;
        const userId = req.id; // Lấy ID của người dùng đang đăng nhập
        const userRole = req.userRole; // Lấy vai trò của người dùng
        
        // Tìm công ty cần xóa
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }
        
        // Nếu là recruiter, kiểm tra xem họ có phải là người tạo công ty không
        if (userRole === 'recruiter' && company.userId.toString() !== userId) {
            return res.status(403).json({
                message: "You can only delete companies that you created",
                success: false
            });
        }
        
        // Xóa tất cả công việc liên quan đến công ty này
        const deletedJobs = await Job.deleteMany({ company: companyId });
        
        // Xóa công ty
        await Company.findByIdAndDelete(companyId);
        
        return res.status(200).json({
            message: "Company and all related jobs deleted successfully",
            deletedJobsCount: deletedJobs.deletedCount,
            success: true
        });
    } catch (error) {
        console.log(`Error deleting company: ${error.message}`);
        return res.status(500).json({
            message: "Fail to delete company",
            error: error.message,
            success: false
        });
    }
}