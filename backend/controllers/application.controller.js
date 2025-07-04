import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            })
        };
        // check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        // check if the jobs exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }        // create a new application
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
        });

        job.applications.push(newApplication._id);
        // Increase new applications count
        job.newApplicationsCount = (job.newApplicationsCount || 0) + 1;
        await job.save();
        return res.status(201).json({
            message: "Job applied successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};

export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const application = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
            path: 'job',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'company',
                options: { sort: { createdAt: -1 } },
            }
        });
        if (!application) {
            return res.status(404).json({
                message: "No Applications",
                success: false
            })
        };
        return res.status(200).json({
            application,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

// admin will see how many users have applied
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant'
            }
        });
        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            })
        };
        return res.status(200).json({
            job,
            succees: true
        });
    } catch (error) {
        console.log(error);
    }
}

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;
        if (!status) {
            return res.status(400).json({
                message: 'status is required',
                success: false
            })
        };

        // find the application by applicantion id
        const application = await Application.findOne({ _id: applicationId });
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            })
        };        // update the status
        application.status = status.toLowerCase();
        await application.save();

        // Decrease new applications count when status is updated to accepted or rejected
        if (status.toLowerCase() === 'accepted' || status.toLowerCase() === 'rejected') {
            // Find job related to this application
            const job = await Job.findById(application.job);
            if (job && job.newApplicationsCount > 0) {
                job.newApplicationsCount -= 1;
                await job.save();
            }
        }

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true
        });

    } catch (error) {
        console.log(error);
    }
}

/**
 * Allow applicant to cancel their job application
 * Delete the application and update the job
 */
export const cancelApplication = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            });
        }
        
        // Find the job
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }
          // Find the application to delete
        const application = await Application.findOne({ job: jobId, applicant: userId });
        if (!application) {
            return res.status(404).json({
                message: "Application not found",
                success: false
            });
        }
        
        // Check application status
        if (application.status === "accepted" || application.status === "rejected") {
            return res.status(400).json({
                message: "Cannot cancel application that has already been accepted or rejected",
                success: false
            });
        }        
        // Remove application id from the job's applications array
        job.applications = job.applications.filter(
            app => app.toString() !== application._id.toString()
        );
        
        // If the application is in pending status (not yet processed), reduce new application count
        if (application.status === "pending" && job.newApplicationsCount > 0) {
            job.newApplicationsCount -= 1;
        }
        
        await job.save();
        
        // Delete application
        await Application.findByIdAndDelete(application._id);
        
        return res.status(200).json({
            message: "Application cancelled successfully.",
            success: true
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to cancel application",
            error: error.message,
            success: false
        });
    }
}