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
        
        // Check if any file is submitted
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
        // Check if any file is submitted
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

// Function to clean up savedJobs - remove job IDs that no longer exist
export const cleanUpSavedJobs = async (req, res) => {
    try {
        const userId = req.id;
        
        // Find user that needs processing
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        // No savedJobs to process
        if (!user.savedJobs || user.savedJobs.length === 0) {
            return res.status(200).json({
                message: "No saved jobs to clean up",
                success: true,
                jobsRemoved: 0
            });
        }
        
        const savedJobsBeforeCleanup = [...user.savedJobs];
        const validJobIds = [];
        
        // Check if each job ID still exists
        for (const jobId of user.savedJobs) {
            const jobExists = await Job.exists({ _id: jobId });
            if (jobExists) {
                validJobIds.push(jobId);
            }
        }
        
        // Update savedJobs array with only valid IDs
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
 * Get list of all users (only applicant and recruiter)
 * Admin endpoint - only for administrators
 */
export const getAllUsers = async (req, res) => {
    try {
        // Can add query parameters to filter by role or search by name
        const { role, search, page = 1, limit = 10 } = req.query;
        
        // Build query for searching
        let query = {
            // Exclude users with admin role from results
            role: { $ne: 'admin' }
        };
        
        // Filter by role if requested
        if (role && role !== 'all') {
            query.role = role;
        }
        
        // Search by name if provided
        if (search) {
            query.fullname = { $regex: search, $options: "i" };
        }
        
        // Count total documents that match the criteria
        const total = await User.countDocuments(query);
        
        // Calculate skip for pagination
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        
        // Execute query to get users with pagination
        const users = await User.find(query)
            .select("-password") // Remove password field for security
            .sort({ createdAt: -1 }) // Sort by creation time, newest first
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
 * Get list of all users without pagination
 * Admin endpoint - only for administrators
 */
export const getAllUsersNoPage = async (req, res) => {
    try {
        // Can add query parameters to filter by role or search by name
        const { role, search } = req.query;
        
        // Build query for searching
        let query = {
            // Exclude users with admin role from results
            role: { $ne: 'admin' }
        };
        
        // Filter by role if requested
        if (role && role !== 'all') {
            query.role = role;
        }
        
        // Search by name if provided
        if (search) {
            query.fullname = { $regex: search, $options: "i" };
        }
        
        // Get all users without pagination
        const users = await User.find(query)
            .select("-password") // Remove password field for security
            .sort({ createdAt: -1 }); // Sort by creation time, newest first
        
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
 * Create a new admin account
 * This API is protected with a secret key
 */
export const createAdmin = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, secretKey } = req.body;
        
        // Check secret key to create admin
        // Use value from environment variable or a default value if not available
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
        
        // Check if email already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'Used email',
                success: false,
            });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin account
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
 * Delete a user and all related data
 * Admin endpoint - only for administrators
 */
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Find the user to delete
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        // Do not allow deleting admin accounts
        if (userToDelete.role === 'admin') {
            return res.status(403).json({
                message: "Cannot delete admin accounts",
                success: false
            });
        }
        
        // Statistics of deleted data to return
        const deletedData = {
            companies: 0,
            jobs: 0,
            applications: 0
        };

        // Import necessary models
        const { Company } = await import("../models/company.model.js");
        const { Job } = await import("../models/job.model.js");
        const { Application } = await import("../models/application.model.js");
        
        // Process based on user role
        if (userToDelete.role === 'recruiter') {
            // 1. Find all companies created by this recruiter
            const companies = await Company.find({ userId: userId });
            deletedData.companies = companies.length;
            
            // 2. Find and delete all jobs belonging to these companies
            for (const company of companies) {
                const jobs = await Job.find({ company: company._id });
                deletedData.jobs += jobs.length;
                
                // 3. Delete all applications for these jobs
                for (const job of jobs) {
                    const applications = await Application.deleteMany({ job: job._id });
                    deletedData.applications += applications.deletedCount;
                }
                
                // 4. Delete all jobs of the company
                await Job.deleteMany({ company: company._id });
            }
            
            // 5. Delete all companies of this recruiter
            await Company.deleteMany({ userId: userId });
            
        } else if (userToDelete.role === 'applicant') {
            // 1. Find and delete all applications of this applicant
            const applications = await Application.deleteMany({ applicant: userId });
            deletedData.applications = applications.deletedCount;
        }
        
        // Delete the user
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
 * Get list of all users with applicant role
 * Admin endpoint - only for administrators
 */
export const getAllApplicants = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        
        // Build query to search for applicants
        let query = {
            role: 'applicant' // Only get users with applicant role
        };
        
        // Search by name if provided
        if (search) {
            query.fullname = { $regex: search, $options: "i" };
        }
        
        // Count total applicants that match the criteria
        const total = await User.countDocuments(query);
        
        // Calculate skip for pagination
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        
        // Execute query to get list of applicants with pagination
        const applicants = await User.find(query)
            .select("-password") // Remove password field for security
            .sort({ createdAt: -1 }) // Sort by creation time, newest first
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
 * Get list of all users with recruiter role
 * Admin endpoint - only for administrators
 */
export const getAllRecruiters = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        
        // Build query to search for recruiters
        let query = {
            role: 'recruiter' // Only get users with recruiter role
        };
        
        // Search by name if provided
        if (search) {
            query.fullname = { $regex: search, $options: "i" };
        }
        
        // Count total recruiters that match the criteria
        const total = await User.countDocuments(query);
        
        // Calculate skip value for pagination
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        
        // Execute query to get list of recruiters with pagination
        const recruiters = await User.find(query)
            .select("-password") // Remove password field for security
            .sort({ createdAt: -1 }) // Sort by creation time, newest first
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