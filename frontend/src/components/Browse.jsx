import { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Browse = () => {
    useGetAllJobs();
    const dispatch = useDispatch();
    const { allJobs, searchedQuery } = useSelector(store => store.job);
      console.log("Current search query:", searchedQuery);
    
    // Create intermediate variable for title
    const searchTitle = searchedQuery 
        ? `Search Results for "${searchedQuery}" (${allJobs.length})` 
        : `Search Results (${allJobs.length})`;
    
    console.log("Title will be:", searchTitle);
    
    // Add state for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 6; // Number of jobs per page (6 jobs/page for applicant)
    
    // Calculate jobs for current page
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = allJobs.slice(indexOfFirstJob, indexOfLastJob);
    
    // Pagination navigation functions
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    const nextPage = () => {
        if (currentPage < Math.ceil(allJobs.length / jobsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    // Reset query when leaving the page
    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(""));
        }
    }, []);
      // Reset to page 1 when allJobs changes (when new search)
    useEffect(() => {
        setCurrentPage(1);
    }, [allJobs]);
      return (
        <div>            
            <Navbar />            
            <div className='max-w-7xl mx-auto my-10 px-24'>
                <h1 className='font-bold text-xl my-10'>
                    {searchTitle}
                </h1>
                <div className='grid grid-cols-3 gap-4'>
                    {
                        currentJobs.map((job) => {
                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3 }}
                                    key={job._id}
                                >
                                    <Job job={job} />
                                </motion.div>
                            )
                        })
                    }
                </div>
                
                {/* Pagination */}
                {allJobs.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-2 gap-4">
                        <div className="flex items-center space-x-2 order-2 sm:order-1">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={prevPage} 
                                disabled={currentPage === 1}
                                className="flex items-center gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            
                            {/* Display page numbers */}
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.ceil(allJobs.length / jobsPerPage) }, (_, i) => i + 1).map((pageNum) => (
                                    <Button
                                        key={pageNum}
                                        variant={pageNum === currentPage ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => paginate(pageNum)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {pageNum}
                                    </Button>
                                ))}
                            </div>
                            
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={nextPage} 
                                disabled={currentPage >= Math.ceil(allJobs.length / jobsPerPage)}
                                className="flex items-center gap-1"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="text-sm text-gray-500 order-1 sm:order-2">
                            Showing {indexOfFirstJob + 1} to {Math.min(indexOfLastJob, allJobs.length)} of {allJobs.length} jobs
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Browse