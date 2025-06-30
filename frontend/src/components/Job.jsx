import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import useManageSavedJobs from '@/hooks/useManageSavedJobs'
import { useSelector } from 'react-redux'

const Job = ({ job }) => {
    const navigate = useNavigate();
    const { user, savedJobs } = useSelector(store => store.auth);
    const { saveJob, unsaveJob, isLoading } = useManageSavedJobs();
    const [isSaved, setIsSaved] = useState(false);    const daysAgoFunction = (mongodbTime) => {
        if (!mongodbTime) return 0;
        try {
            const createdAt = new Date(mongodbTime);
            const currentTime = new Date();
            const timeDifference = currentTime - createdAt;
            return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
        } catch (error) {
            console.error("Error calculating days ago:", error);
            return 0;
        }
    }

    // Check if this job is in user's saved jobs
    useEffect(() => {
        if (savedJobs && savedJobs.length > 0) {
            const jobIsSaved = savedJobs.some(savedJob => savedJob._id === job?._id);
            setIsSaved(jobIsSaved);
        } else {
            setIsSaved(false);
        }
    }, [savedJobs, job]);

    const handleSaveToggle = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        if (isSaved) {
            unsaveJob(job?._id);
        } else {
            saveJob(job?._id);
        }
    };    return (
        <div className='p-5 rounded-md shadow-xl bg-white border border-gray-100'>
            <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-500'>
                    {job?.createdAt 
                        ? (daysAgoFunction(job.createdAt) === 0 ? "Today" : `${daysAgoFunction(job.createdAt)} days ago`)
                        : "N/A"}
                </p>
                <Button 
                    variant="outline" 
                    className="rounded-full" 
                    size="icon"
                    onClick={handleSaveToggle}
                    disabled={isLoading}
                >
                    {isSaved ? <BookmarkCheck className="text-[#14AE5C]" /> : <Bookmark />}
                </Button>
            </div>

            <div className='flex items-center gap-2 my-2'>
                <Button className="p-6" variant="outline" size="icon">
                    <Avatar>
                        <AvatarImage src={job?.company?.logo} />
                    </Avatar>
                </Button>
                <div>
                    <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
                    <p className='text-sm text-gray-500'>Vietnam</p>
                </div>
            </div>

            <div>
                <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
                <p className='text-sm text-gray-600'>{job?.description}</p>
            </div>
            
            {/* Thay đổi từ flex thành flex-wrap để các badges có thể xuống dòng khi không đủ chỗ */}
            <div className='flex flex-wrap items-center gap-2 mt-4'>
                <Badge className={'text-blue-700 font-bold text-xs'} variant="ghost">{job?.position} Positions</Badge>
                <Badge className={'text-[#FBBC09] font-bold text-xs'} variant="ghost">{job?.jobType}</Badge>
                <Badge className={'text-[#14AE5C] font-bold text-xs'} variant="ghost">{job?.salary}tr VND</Badge>
            </div>
            
            {/* Thêm justify-between để buttons căn đều hai bên */}
            <div className='flex items-center justify-between gap-2 mt-4'>
                <Button onClick={() => navigate(`/description/${job?._id}`)} variant="outline" className="text-sm px-4">Details</Button>
                <Button 
                    onClick={handleSaveToggle} 
                    className={`text-sm px-3 ${isSaved ? 'bg-gray-500' : 'bg-[#007771]'}`}
                    disabled={isLoading}
                >
                    {isSaved ? 'Saved' : 'Save For Later'}
                </Button>
            </div>
        </div>
    )
}

export default Job