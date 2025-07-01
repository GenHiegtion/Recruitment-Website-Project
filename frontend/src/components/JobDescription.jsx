import { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);
    const [applicationStatus, setApplicationStatus] = useState("pending");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCancelingApplication, setIsCancelingApplication] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Check user role
    const isAdmin = user?.role === 'admin';
    const isRecruiter = user?.role === 'recruiter';

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });
            console.log(res.data);
            if (res.data.success) {
                setIsApplied(true); // Update the local state
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] }
                dispatch(setSingleJob(updatedSingleJob)); // helps us to real time UI update
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);            toast.error(error.response.data.message);
        }
    };
    
    const openDeleteDialog = () => {
        setIsDeleteDialogOpen(true);
    };
    
    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
    }
    
    const openCancelDialog = () => {
        setIsCancelDialogOpen(true);
    }

    const closeCancelDialog = () => {
        setIsCancelDialogOpen(false);
    }
    
    // Function to handle canceling an application
    const cancelApplicationHandler = async () => {
        try {
            setIsCancelingApplication(true);
            const res = await axios.delete(`${APPLICATION_API_END_POINT}/cancel/${jobId}`, { 
                withCredentials: true 
            });
            
            if (res.data.success) {
                setIsApplied(false); // Update application status
                
                // Update applications list in singleJob
                const updatedApplications = singleJob.applications.filter(
                    application => application.applicant !== user?._id
                );
                const updatedSingleJob = { ...singleJob, applications: updatedApplications };
                dispatch(setSingleJob(updatedSingleJob));
                
                toast.success(res.data.message || 'Application cancelled successfully');
                setIsCancelDialogOpen(false);
            }
        } catch (error) {
            console.error('Error cancelling application:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel application');
        } finally {
            setIsCancelingApplication(false);
        }
    };

    const deleteJobHandler = async () => {
        try {
            setIsDeleting(true);
            const res = await axios.delete(`${JOB_API_END_POINT}/delete/${jobId}`, { withCredentials: true });
            
            if (res.data.success) {
                toast.success(res.data.message || 'Deleted job successfully!');     // Redirect to job listing page based on role
                if (isAdmin) {
                    navigate('/admin/all-jobs');
                } else if (isRecruiter) {
                    navigate('/admin/jobs');
                }
            }
        } catch (error) {
            console.error('Fail to delete job:', error);
            toast.error(error.response?.data?.message || 'Unable to delete job!');
        } finally {
            setIsDeleting(false);            setIsDeleteDialogOpen(false);
        }
    };
    
    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    
                    // Check if the user has already applied for this job
                    setIsApplied(res.data.job.applications.some(app => app.applicant === user?._id));
                    
                    // If already applied, need to get additional information about the application
                    if (user?._id && res.data.job.applications.some(app => app.applicant === user?._id)) {
                        try {
                            // Get list of user applications
                            const appRes = await axios.get(`${APPLICATION_API_END_POINT}/get`, { withCredentials: true });
                            
                            if (appRes.data.success) {
                                // Find application for current job
                                const currentJobApplication = appRes.data.application.find(
                                    app => app.job?._id === jobId
                                );
                                
                                // Update status of application (pending/accepted/rejected)
                                if (currentJobApplication) {
                                    setApplicationStatus(currentJobApplication.status || "pending");
                                }
                            }
                        } catch (appError) {
                            console.error("Error fetching application status:", appError);
                        }
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);return (
        <div className='max-w-7xl mx-auto my-10 px-24'>
            {/* Back button for Admin */}
            {isAdmin && (
                <Button 
                    variant="ghost" 
                    className="mb-6 flex items-center"
                    onClick={() => navigate('/admin/all-jobs')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            )}
              {/* Back button for Recruiter */}
            {isRecruiter && (
                <Button 
                    variant="ghost" 
                    className="mb-6 flex items-center"
                    onClick={() => navigate('/admin/jobs')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            )}
            
            {/* Back button for Applicant */}
            {!isAdmin && !isRecruiter && (
                <Button 
                    variant="ghost" 
                    className="mb-6 flex items-center"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            )}
            
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='font-bold text-xl'>{singleJob?.title}</h1>
                    <div className='flex items-center gap-2 mt-4'>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.postion} Positions</Badge>
                        <Badge className={'text-[#FBBC09] font-bold'} variant="ghost">{singleJob?.jobType}</Badge>
                        <Badge className={'text-[#14AE5C] font-bold'} variant="ghost">{singleJob?.salary}tr VND</Badge>
                    </div>                </div>                {isAdmin || isRecruiter ? (
                    <Button
                        onClick={openDeleteDialog}
                        className="bg-red-600 hover:bg-red-700 rounded-lg flex gap-2 items-center"
                    >
                        <Trash2 size={18} />
                        Delete job
                    </Button>                ) : (
                    isApplied ? (
                        <div className="flex space-x-2">
                            <Button
                                className={`rounded-lg ${
                                    applicationStatus === "accepted" ? "bg-green-600" : 
                                    applicationStatus === "rejected" ? "bg-red-600" : 
                                    "bg-gray-600"
                                }`}
                                disabled
                            >
                                {applicationStatus === "accepted" ? "Accepted" : 
                                 applicationStatus === "rejected" ? "Rejected" : 
                                 "Applied"}
                            </Button>
                            {applicationStatus === "pending" && (
                                <Button
                                    onClick={openCancelDialog}
                                    className="rounded-lg bg-red-500 hover:bg-red-600"
                                >
                                    Cancel Application
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Button
                            onClick={applyJobHandler}
                            className="rounded-lg bg-[#14AE5C] hover:bg-[#007771]"
                        >
                            Apply Now
                        </Button>
                    )
                )}
            </div>
            <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Description</h1>
            <div className='my-4'>
                <h1 className='font-bold my-1'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title}</span></h1>
                <h1 className='font-bold my-1'>Location: <span className='pl-4 font-normal text-gray-800'>{singleJob?.location}</span></h1>
                <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description}</span></h1>
                <h1 className='font-bold my-1'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experienceLevel} yrs</span></h1>
                <h1 className='font-bold my-1'>Job Type: <span className='pl-4 font-normal text-gray-800'>{singleJob?.jobType}</span></h1>
                <h1 className='font-bold my-1'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary}tr VND</span></h1>                <h1 className='font-bold my-1'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob?.applications?.length}</span></h1>
                <h1 className='font-bold my-1'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleJob?.createdAt ? singleJob.createdAt.split("T")[0] : "N/A"}</span></h1>
            </div>

            {/* Delete confirmation dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg">Delete Confirm</DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure to delete this job? <br />
                            This action can not be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-center gap-4 sm:justify-center">
                        <Button
                            variant="destructive"
                            onClick={deleteJobHandler}
                            disabled={isDeleting}
                            className="min-w-[100px]"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={closeDeleteDialog}
                            className="min-w-[100px]"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>            </Dialog>
            
            {/* Cancel Application Dialog */}
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Application</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your application for this job?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeCancelDialog}>
                            No, keep my application
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={cancelApplicationHandler}
                            disabled={isCancelingApplication}
                        >
                            {isCancelingApplication ? 'Canceling...' : 'Yes, cancel application'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default JobDescription