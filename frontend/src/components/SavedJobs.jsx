import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import useManageSavedJobs from '@/hooks/useManageSavedJobs'
import Navbar from './shared/Navbar'
import Footer from './shared/Footer'
import Job from './Job'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'
import { BookmarkX } from 'lucide-react'

const SavedJobs = () => {
    const { user, savedJobs } = useSelector(store => store.auth);
    const { fetchSavedJobs, isLoading } = useManageSavedJobs();
    const navigate = useNavigate();

    // Fetch saved jobs when the component mounts
    useEffect(() => {
        if (user) {
            fetchSavedJobs();
        } else {
            navigate('/login');
        }
    }, [user]);

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Saved Jobs</h1>
                
                {isLoading && (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#007771]"></div>
                    </div>
                )}
                
                {!isLoading && savedJobs.length === 0 && (
                    <div className="flex flex-col justify-center items-center h-60 bg-gray-50 rounded-lg">
                        <BookmarkX className="h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg mb-4">You haven't saved any jobs yet.</p>
                        <Button 
                            onClick={() => navigate('/jobs')}
                            className="bg-[#007771]"
                        >
                            Browse Jobs
                        </Button>
                    </div>
                )}
                
                {!isLoading && savedJobs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedJobs.map(job => (
                            <Job key={job._id} job={job} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default SavedJobs