import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { Search, Briefcase, ExternalLink, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '../ui/input'
import { toast } from 'sonner'
import useGetAllJobsAdmin from '@/hooks/useGetAllJobsAdmin'
import { 
    Table, 
    TableBody, 
    TableCaption, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'

const AdminAllJobs = () => {
    const { user } = useSelector(store => store.auth)
    const { allAdminJobs: jobs } = useSelector(store => store.job)
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [searchTimeout, setSearchTimeout] = useState(null)
    
    // Thêm state cho phân trang
    const [currentJobs, setCurrentJobs] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const jobsPerPage = 5 // Số công việc trên mỗi trang
    
    // Sử dụng custom hook để lấy danh sách job
    const { loading } = useGetAllJobsAdmin(search)

    // Chỉ cho phép admin truy cập trang này
    useEffect(() => {
        if (!user) {
            navigate('/login')
        } else if (user.role !== 'admin') {
            navigate('/')
            toast.error('You have no authorization to access this page')
        }
    }, [user, navigate])

    // Cập nhật danh sách công việc theo trang hiện tại
    useEffect(() => {
        updateCurrentPageJobs()
    }, [currentPage, jobs])

    // Xử lý tìm kiếm với debounce
    const handleSearch = (e) => {
        const searchTerm = e.target.value
        setSearch(searchTerm)
        
        // Clear timeout trước đó nếu có
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }
        
        // Tạo timeout mới để delay việc tìm kiếm
        const timeout = setTimeout(() => {
            // Tìm kiếm sẽ được thực hiện trong useGetAllJobsAdmin hook
            setCurrentPage(1) // Reset về trang đầu tiên khi tìm kiếm
        }, 500)
        
        setSearchTimeout(timeout)
    }    // Format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            console.error("Error formatting date:", error);
            return "N/A";
        }
    }
    
    // Cập nhật danh sách công việc hiển thị dựa trên trang hiện tại
    const updateCurrentPageJobs = () => {
        if (!jobs) return
        const indexOfLastJob = currentPage * jobsPerPage
        const indexOfFirstJob = indexOfLastJob - jobsPerPage
        setCurrentJobs(jobs.slice(indexOfFirstJob, indexOfLastJob))
    }
    
    // Chuyển sang trang tiếp theo
    const nextPage = () => {
        if (currentPage < Math.ceil((jobs?.length || 0) / jobsPerPage)) {
            setCurrentPage(currentPage + 1)
        }
    }
    
    // Quay lại trang trước
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Job Management</h1>
                
                {/* Tiêu đề và số liệu tổng quan */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Jobs Number</p>
                            <h3 className="text-2xl font-bold">{jobs?.length || 0}</h3>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <Briefcase className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>
                </div>
                
                {/* Ô tìm kiếm */}
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Search by name"
                            value={search}
                            onChange={handleSearch}
                            className="pl-8"
                        />
                    </div>
                </div>

                {/* Hiển thị số lượng việc làm tìm thấy */}
                <div className="text-sm text-gray-500 mb-4">
                    Found {jobs?.length || 0} jobs
                    {search ? ` fit "${search}"` : ''}
                </div>

                {/* Bảng danh sách job */}
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#007771]"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">No.</TableHead>
                                    <TableHead className="w-[60px]">Company</TableHead>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Salary</TableHead>
                                    <TableHead>Job Type</TableHead>
                                    <TableHead>Posted By</TableHead>
                                    <TableHead className="w-[120px]">Post Day</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!currentJobs || currentJobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center">No job data</TableCell>
                                    </TableRow>
                                ) : (
                                    currentJobs.map((job, index) => (
                                        <TableRow key={job._id}>
                                            <TableCell>{(currentPage - 1) * jobsPerPage + index + 1}</TableCell>
                                            <TableCell>
                                                <Avatar className="cursor-pointer" title={job.company?.name}>
                                                    <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">{job.title}</TableCell>
                                            <TableCell>{job.location || "--"}</TableCell>
                                            <TableCell>{job.salary}tr VND</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`font-medium ${job.jobType === 'Full-time' ? 'text-red-500' : 'text-[#FBBC09]'}`}>
                                                    {job.jobType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{job.created_by?.fullname || "Không xác định"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatDate(job.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    onClick={() => navigate(`/description/${job._id}`)}
                                                    className="bg-white text-gray-700 hover:bg-[#007771] hover:text-white transition-colors"
                                                    size="sm"
                                                    variant="ghost"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Detail
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        
                        {/* Thêm phân trang */}
                        {jobs && jobs.length > 0 && (
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
                                    
                                    {/* Hiển thị các số trang */}
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: Math.ceil((jobs?.length || 0) / jobsPerPage) }, (_, i) => i + 1).map((pageNum) => (
                                            <Button
                                                key={pageNum}
                                                variant={pageNum === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
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
                                        disabled={currentPage >= Math.ceil((jobs?.length || 0) / jobsPerPage)}
                                        className="flex items-center gap-1"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                <div className="text-sm text-gray-500 order-1 sm:order-2">
                                    Showing {((currentPage - 1) * jobsPerPage) + 1} to {Math.min(currentPage * jobsPerPage, jobs?.length || 0)} of {jobs?.length || 0} jobs
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminAllJobs