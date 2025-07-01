import { Job } from "../models/job.model.js";

// recruiter posts job
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
        
        // Initialize query object
        const query = {};
        
        // Add search by keyword if provided
        if (keyword) {
            // More precise search
            const keywordPattern = keyword.trim(); // Remove extra whitespace
            query.$or = [
                { title: { $regex: `\\b${keywordPattern}\\b`, $options: "i" } }, // Only find complete words
                { description: { $regex: `\\b${keywordPattern}\\b`, $options: "i" } },
            ];
        }
        
        // Add filter by location if provided
        if (location) {
            query.location = { $regex: location, $options: "i" };
        }
        
        // Add filter by industry/position (using title field directly)
        if (title) {
            query.title = { $regex: title, $options: "i" };
        }
        
        // Add filter by company if provided
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

// how many jobs posted by recruiter
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
 * Get all jobs in the system (admin only)
 */
export const getAllJobsAdmin = async (req, res) => {
    try {
        const { search, company } = req.query;
        
        // Build search query
        let query = {};
        
        // Search by keyword (title or description) if provided
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }
        
        // Search by company if provided
        if (company) {
            query.company = company;
        }

        // Execute query with populate to get company and creator information
        const jobs = await Job.find(query)
            .populate({
                path: 'company',
                select: 'name logo location' // Only get necessary fields
            })
            .populate({
                path: 'created_by',
                select: 'fullname email' // Only get necessary fields
            })
            .populate({
                path: 'applications',
                select: '_id' // Only get ID to count the number
            })
            .sort({ createdAt: -1 }); // Sort by creation time, newest first
            
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

// Admin gets all jobs in the system (with pagination)
export const getAllJobsForAdmin = async (req, res) => {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;
        
        // Initialize query object
        const query = {};
        
        // Add keyword search if provided
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ];
        }
        
        // Count the total number of jobs matching the conditions
        const total = await Job.countDocuments(query);
        
        // Set up pagination
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        
        // Get jobs with pagination, sort by newest creation date and populate company
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