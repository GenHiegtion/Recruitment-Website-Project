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
        
        // Initialize updateData object with basic information
        const updateData = { 
            name, 
            description, 
            website, 
            location 
        };

        // Only process file when one is uploaded
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
            company, // Add company to the response so frontend can easily update UI
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
 * Get all companies in the system
 * Admin endpoint - only for administrators
 */
export const getAllCompanies = async (req, res) => {
    try {
        const { search } = req.query;
        
        // Build query for searching
        let query = {};
        
        // Search by name if provided
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        
        // Execute query to get all companies
        const companies = await Company.find(query)
            .populate('userId', 'fullname email') // Get user information who created the company
            .sort({ createdAt: -1 }); // Sort by creation time, newest first
        
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
 * Delete company and all related jobs
 * Admin endpoint - only for administrators
 */
export const deleteCompany = async (req, res) => {    try {
        const companyId = req.params.id;
        const userId = req.id; // Get ID of currently logged in user
        const userRole = req.userRole; // Get user's role
        
        // Find the company to delete
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }
        
        // If recruiter, check if they are the creator of the company
        if (userRole === 'recruiter' && company.userId.toString() !== userId) {
            return res.status(403).json({
                message: "You can only delete companies that you created",
                success: false
            });
        }
        
        // Delete all jobs related to this company
        const deletedJobs = await Job.deleteMany({ company: companyId });
        
        // Delete the company
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