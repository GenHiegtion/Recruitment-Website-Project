import { setSavedJobs, addSavedJob, removeSavedJob } from '@/redux/authSlice';
import { USER_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const useManageSavedJobs = () => {
    const dispatch = useDispatch();
    const { user, savedJobs } = useSelector(store => store.auth);
    const [isLoading, setIsLoading] = useState(false);

    // Get all saved jobs
    const fetchSavedJobs = async () => {
        if (!user) return;
        
        try {
            setIsLoading(true);
            console.log('Fetching saved jobs from:', `${USER_API_END_POINT}/saved-jobs`);
            const res = await axios.get(`${USER_API_END_POINT}/saved-jobs`, { withCredentials: true });
            console.log('Saved jobs response:', res.data);
            if (res.data.success) {
                dispatch(setSavedJobs(res.data.savedJobs));
            }
        } catch (error) {
            console.log('Error fetching saved jobs:', error);
            toast.error('Unable to load saved jobs');
        } finally {
            setIsLoading(false);
        }
    };

    // Save a job
    const saveJob = async (jobId) => {
        if (!user) {
            toast.error("Please login to save job");
            return;
        }
        
        try {
            setIsLoading(true);
            console.log('Saving job with ID:', jobId);
            console.log('API endpoint:', `${USER_API_END_POINT}/job/${jobId}/save`);
            
            const res = await axios.post(`${USER_API_END_POINT}/job/${jobId}/save`, {}, { 
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Save job response:', res.data);
            
            if (res.data.success) {
                toast.success(res.data.message || 'Đã lưu công việc thành công');
                fetchSavedJobs(); // Refresh saved jobs list
            }
        } catch (error) {
            console.log('Error saving job:', error);
            if (error.response) {
                console.log('Error response data:', error.response.data);
                console.log('Error response status:', error.response.status);
            }
            toast.error(error.response?.data?.message || "Không thể lưu công việc này");
        } finally {
            setIsLoading(false);
        }
    };

    // Unsave a job
    const unsaveJob = async (jobId) => {
        if (!user) return;
        
        try {
            setIsLoading(true);
            console.log('Unsaving job with ID:', jobId);
            console.log('API endpoint:', `${USER_API_END_POINT}/job/${jobId}/unsave`);
            
            const res = await axios.post(`${USER_API_END_POINT}/job/${jobId}/unsave`, {}, { 
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Unsave job response:', res.data);
            
            if (res.data.success) {
                toast.success(res.data.message || 'Đã bỏ lưu công việc');
                dispatch(removeSavedJob(jobId));
            }
        } catch (error) {
            console.log('Error unsaving job:', error);
            if (error.response) {
                console.log('Error response data:', error.response.data);
                console.log('Error response status:', error.response.status);
            }
            toast.error(error.response?.data?.message || "Không thể bỏ lưu công việc này");
        } finally {
            setIsLoading(false);
        }
    };

    // Check if a job is saved by the current user
    const isJobSaved = (jobId) => {
        return savedJobs.some(job => job._id === jobId);
    };

    useEffect(() => {
        if (user) {
            fetchSavedJobs();
        }
    }, [user]);

    return { saveJob, unsaveJob, isLoading, fetchSavedJobs, isJobSaved, savedJobs };
};

export default useManageSavedJobs;