import { Job } from "../models/job.model.js";

// admins post job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location,
            jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location
            || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            })
        };
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: Number(experience),
            position,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

// for applicants
export const getAllJobs = async (req, res) => {
    try {
        const { keyword, location, title, company } = req.query;
        
        // Khởi tạo đối tượng query
        const query = {};
        
        // Thêm tìm kiếm theo từ khóa nếu được cung cấp
        if (keyword) {
            // Tìm kiếm chính xác hơn
            const keywordPattern = keyword.trim(); // Loại bỏ khoảng trắng thừa
            query.$or = [
                { title: { $regex: `\\b${keywordPattern}\\b`, $options: "i" } }, // Chỉ tìm từ hoàn chỉnh
                { description: { $regex: `\\b${keywordPattern}\\b`, $options: "i" } },
            ];
        }
        
        // Thêm lọc theo vị trí nếu được cung cấp
        if (location) {
            query.location = { $regex: location, $options: "i" };
        }
        
        // Thêm lọc theo ngành nghề/vị trí (dùng trực tiếp trường title)
        if (title) {
            query.title = { $regex: title, $options: "i" };
        }
        
        // Thêm lọc theo công ty nếu được cung cấp
        if (company) {
            query.company = company;
        }
        
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        
        return res.status(200).json({
            jobs,
            count: jobs.length,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error fetching jobs: " + error.message,
            success: false
        });
    }
}

// applicant
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
}

// how many jobs posted by admin
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path: 'company',
            createdAt: -1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

// update job
export const updateJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, 
                experienceLevel, location, jobType, position} = req.body;

        const updateData = {
            title,
            description,
            requirements: requirements?.split(",").map(r => r.trim()),
            salary,
            experienceLevel,
            location,
            jobType,
            position
        };

        const job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            })
        }
        return res.status(200).json({
            message: "Job updated.",
            success: true,
            job
        })

    } catch (error) {
        console.log(error);
    }
}

// delete job
export const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        
        const job = await Job.findByIdAndDelete(jobId);
        
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }
        
        return res.status(200).json({
            message: "Deleted job successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Delete Job Error: " + error.message,
            success: false
        });
    }
}

/**
 * Lấy tất cả các jobs trong hệ thống (chỉ dành cho admin)
 */
export const getAllJobsAdmin = async (req, res) => {
    try {
        const { search, company } = req.query;
        
        // Xây dựng query để tìm kiếm
        let query = {};
        
        // Tìm kiếm theo từ khóa (title hoặc description) nếu có
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }
        
        // Tìm kiếm theo công ty nếu có
        if (company) {
            query.company = company;
        }

        // Thực hiện truy vấn với populate để lấy thông tin công ty và người tạo
        const jobs = await Job.find(query)
            .populate({
                path: 'company',
                select: 'name logo location' // Chỉ lấy các trường cần thiết
            })
            .populate({
                path: 'created_by',
                select: 'fullname email' // Chỉ lấy các trường cần thiết
            })
            .populate({
                path: 'applications',
                select: '_id' // Chỉ lấy ID để đếm số lượng
            })
            .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo, mới nhất lên trước
            
        return res.status(200).json({
            message: "Get jobs list successfully",
            jobs,
            count: jobs.length,
            success: true
        });
    } catch (error) {
        console.log(`Error getting all jobs for admin: ${error.message}`);
        return res.status(500).json({
            message: "Fail to get jobs list",
            error: error.message,
            success: false
        });
    }
}

// Admin lấy tất cả job trong hệ thống (với phân trang)
export const getAllJobsForAdmin = async (req, res) => {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;
        
        // Khởi tạo đối tượng query
        const query = {};
        
        // Thêm tìm kiếm theo từ khóa nếu được cung cấp
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ];
        }
        
        // Đếm tổng số job thỏa mãn điều kiện
        const total = await Job.countDocuments(query);
        
        // Thiết lập phân trang
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        
        // Lấy job với phân trang, sắp xếp theo ngày tạo mới nhất và populate company
        const jobs = await Job.find(query)
            .populate({
                path: "company",
                select: "name logo"
            })
            .populate({
                path: "created_by",
                select: "fullname email role"
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);
        
        return res.status(200).json({
            jobs,
            currentPage: pageNumber,
            totalPages: Math.ceil(total / pageSize),
            totalItems: total,
            itemsPerPage: pageSize,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error fetching all jobs: " + error.message,
            success: false
        });
    }
}