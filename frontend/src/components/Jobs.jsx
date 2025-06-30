import { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Jobs = () => {
    const { allJobs, selectedIndustry, selectedLocation } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);
    
    // Thêm state cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 6; // Số job trên mỗi trang (6 job/trang cho applicant)

    useEffect(() => {
        // Bắt đầu với tất cả các công việc
        let filteredJobs = [...allJobs];
        
        // Lọc theo Industry nếu có
        if (selectedIndustry) {
            filteredJobs = filteredJobs.filter(job => 
                job.title.toLowerCase() === selectedIndustry.toLowerCase()
            );
        }
        
        // Lọc theo Location nếu có
        if (selectedLocation) {
            filteredJobs = filteredJobs.filter(job => 
                job.location.toLowerCase() === selectedLocation.toLowerCase()
            );
        }
        
        // Cập nhật state với kết quả lọc
        setFilterJobs(filteredJobs);
        setCurrentPage(1); // Reset về trang đầu khi thay đổi bộ lọc
    }, [allJobs, selectedIndustry, selectedLocation]);
    
    // Lấy job cho trang hiện tại
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filterJobs.slice(indexOfFirstJob, indexOfLastJob);
    
    // Các hàm điều hướng phân trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    const nextPage = () => {
        if (currentPage < Math.ceil(filterJobs.length / jobsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto mt-5 px-24'>
                <div className='flex gap-5'>
                    <div className='w-20%'>
                        <FilterCard />
                    </div>
                    {
                        filterJobs.length <= 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <span className="text-gray-500">Không tìm thấy công việc phù hợp</span>
                            </div>
                        ) : (
                            <div className='flex-1 pb-5'>
                                <div className='grid grid-cols-3 gap-4'>
                                    {
                                        currentJobs.map((job) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 100 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                                key={job?._id}>
                                                <Job job={job} />
                                            </motion.div>
                                        ))
                                    }
                                </div>
                                
                                {/* Phân trang */}
                                {filterJobs.length > 0 && (
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
                                            
                                            {/* Hiển thị các số trang */}
                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: Math.ceil(filterJobs.length / jobsPerPage) }, (_, i) => i + 1).map((pageNum) => (
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
                                                disabled={currentPage >= Math.ceil(filterJobs.length / jobsPerPage)}
                                                className="flex items-center gap-1"
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        
                                        <div className="text-sm text-gray-500 order-1 sm:order-2">
                                            Showing {indexOfFirstJob + 1} to {Math.min(indexOfLastJob, filterJobs.length)} of {filterJobs.length} jobs
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Jobs