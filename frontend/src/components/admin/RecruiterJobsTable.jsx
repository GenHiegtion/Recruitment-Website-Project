import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Edit2, Eye, MoreHorizontal, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);

    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();
    
    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(5);
    
    // State for job delete dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);useEffect(() => {
        const filteredJobs = allAdminJobs.filter((job) => {
            if (!searchJobByText) {
                return true;
            };
            return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) || job?.company?.name.toLowerCase().includes(searchJobByText.toLowerCase());
        });
        setFilterJobs(filteredJobs);
        setCurrentPage(1); // Reset to first page when filters change
    }, [allAdminJobs, searchJobByText])
    
    // Get jobs for the current page
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filterJobs ? filterJobs.slice(indexOfFirstJob, indexOfLastJob) : [];

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Go to next page
    const nextPage = () => {
        if (currentPage < Math.ceil((filterJobs?.length || 0) / jobsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };    // Go back to previous page
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    // Handle job deletion
    const handleDeleteJob = async () => {
        if (!jobToDelete) return;
        
        try {
            setIsDeleting(true);
            const response = await axios.delete(`${JOB_API_END_POINT}/delete/${jobToDelete._id}`, {
                withCredentials: true
            });
            
            if (response.data.success) {
                // Update state to display list without the just deleted job
                setFilterJobs(prevJobs => 
                    prevJobs.filter(job => job._id !== jobToDelete._id)
                );
                
                toast.success(`Deleted job ${jobToDelete.title} and relevant application.`);
                
                // If current page has no jobs left after deletion and it's not the first page
                // then go back to previous page
                if (currentJobs.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } else {
                toast.error('Unable to delete job');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error(error.response?.data?.message || 'Fail to delete job');
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setJobToDelete(null);
        }
    };
    
    return (
        <div>
            <Table>                <TableHeader>
                    <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">New application</TableHead>
                        <TableHead className="w-[150px]">Detail</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        currentJobs?.map((job) => (                            <tr key={job._id}>                                <TableCell>{job?.company?.name}</TableCell>
                                <TableCell>{job?.title}</TableCell>
                                <TableCell>{job?.createdAt ? job.createdAt.split("T")[0] : "N/A"}</TableCell>
                                <TableCell className="text-center">
                                    {job?.newApplicationsCount > 0 ? (
                                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                            {job.newApplicationsCount}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-gray-600 bg-gray-200 rounded-full">
                                            0
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="w-[150px]">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => navigate(`/description/${job._id}`)}
                                        className="hover:bg-[#007771] hover:text-white flex items-center gap-1"
                                        title="View details"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                </TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                        <PopoverContent className="w-32">                                            <div onClick={() => navigate(`/admin/jobs/${job._id}`)} className='flex items-center gap-2 w-fit cursor-pointer'>
                                                <Edit2 className='w-4' />
                                                <span>Edit</span>
                                            </div>
                                            <div onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)} className='flex items-center w-fit gap-2 cursor-pointer mt-2'>
                                                <Eye className='w-4' />
                                                <span>Applicants</span>
                                            </div>
                                            <div 
                                                onClick={() => {
                                                    setJobToDelete(job);
                                                    setIsDeleteDialogOpen(true);
                                                }} 
                                                className='flex items-center gap-2 w-fit cursor-pointer mt-2 text-red-600 hover:text-red-800'
                                            >
                                                <Trash2 className='w-4' />
                                                <span>Delete</span>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </tr>
                        ))
                    }
                </TableBody>
            </Table>

            {/* Pagination */}
            {filterJobs && filterJobs.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2 gap-4">
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
                            {Array.from({ length: Math.ceil((filterJobs?.length || 0) / jobsPerPage) }, (_, i) => i + 1).map((pageNum) => (
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
                            disabled={currentPage >= Math.ceil((filterJobs?.length || 0) / jobsPerPage)}
                            className="flex items-center gap-1"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="text-sm text-gray-500 order-1 sm:order-2">
                        Showing {((currentPage - 1) * jobsPerPage) + 1} to {Math.min(currentPage * jobsPerPage, filterJobs.length)} of {filterJobs.length} jobs
                    </div>                </div>
            )}
            
            {/* Delete confirmation dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg">Delete Confirm</DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure to delete job {jobToDelete?.title}? <br />
                            All application of this job will be deleted too. <br />
                            This action can not be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-center gap-4 sm:justify-center">
                        <Button
                            variant="destructive"
                            onClick={handleDeleteJob}
                            disabled={isDeleting}
                            className="min-w-[100px]"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="min-w-[100px]"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AdminJobsTable