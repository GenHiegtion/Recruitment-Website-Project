import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../shared/Navbar'
import { Trash2, Building, ArrowLeft, Briefcase } from 'lucide-react'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import axios from 'axios'
import { COMPANY_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Badge } from '../ui/badge'

const CompanyDetail = () => {
    const { user } = useSelector(store => store.auth)
    const navigate = useNavigate()
    const { id } = useParams()
    const [company, setCompany] = useState(null)
    const [companyJobs, setCompanyJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)    // Chỉ cho phép admin và recruiter truy cập trang này
    useEffect(() => {
        if (!user) {
            navigate('/login')
        } else if (user.role !== 'admin' && user.role !== 'recruiter') {
            navigate('/')
            toast.error('You have no authorization to access this page')
        }
    }, [user, navigate])

    // Lấy thông tin chi tiết công ty
    useEffect(() => {
        const fetchCompanyDetail = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`${COMPANY_API_END_POINT}/get/${id}`, {
                    withCredentials: true
                })
                
                if (response.data.success) {
                    setCompany(response.data.company)
                    
                    // Lấy danh sách công việc của công ty này
                    try {
                        const jobsResponse = await axios.get(`${JOB_API_END_POINT}/get?company=${id}`, {
                            withCredentials: true
                        })
                        
                        if (jobsResponse.data.success) {
                            setCompanyJobs(jobsResponse.data.jobs || [])
                        }
                    } catch (error) {
                        console.error('Error fetching company jobs:', error)
                    }                } else {
                    toast.error('Failed to load company information')
                    // Điều hướng dựa trên vai trò
                    if (user.role === 'admin') {
                        navigate('/admin/companies-all')
                    } else {
                        navigate('/admin/companies')
                    }
                }
            } catch (error) {
                console.error('Error fetching company details:', error)
                toast.error('Error loading company information')
                // Điều hướng dựa trên vai trò
                if (user.role === 'admin') {
                    navigate('/admin/companies-all')
                } else {
                    navigate('/admin/companies')
                }
            } finally {
                setLoading(false)
            }
        }
        
        if (id) {
            fetchCompanyDetail()
        }
    }, [id, navigate])

    const openDeleteDialog = () => {
        setIsDeleteDialogOpen(true);
    }

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
    }

    const handleDeleteCompany = async () => {
        try {
            setIsDeleting(true);
            const response = await axios.delete(`${COMPANY_API_END_POINT}/delete/${id}`, {
                withCredentials: true
            });
              if (response.data.success) {
                toast.success(`Deleted company ${company.name} and ${response.data.deletedJobsCount} relevant jobs`);
                // Điều hướng dựa trên vai trò
                if (user.role === 'admin') {
                    navigate('/admin/companies-all');
                } else {
                    navigate('/admin/companies');
                }
            } else {
                toast.error('Failed to delete company');
            }
        } catch (error) {
            console.error('Error deleting company:', error);
            toast.error(error.response?.data?.message || 'Error deleting company');
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };    // Format ngày tháng
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

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007771]"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">                <div className="flex items-center justify-between mb-6">
                    <Button 
                        variant="ghost" 
                        className="mb-4 flex items-center"
                        onClick={() => {
                            // Kiểm tra vai trò người dùng để điều hướng đến trang phù hợp
                            if (user.role === 'admin') {
                                navigate('/admin/companies-all');
                            } else {
                                // Nếu là recruiter hoặc vai trò khác, điều hướng đến trang quản lý công ty
                                navigate('/admin/companies');
                            }
                        }}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    
                    {/* Chỉ hiển thị nút delete cho admin */}
                    {user.role === 'admin' && (
                        <Button
                            onClick={openDeleteDialog}
                            className="bg-red-600 hover:bg-red-700 rounded-lg flex gap-2 items-center"
                        >
                            <Trash2 size={18} />
                            Delete company
                        </Button>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Logo và thông tin cơ bản */}
                        <div className="w-full md:w-1/3 flex flex-col items-center">
                            <Avatar className="h-40 w-40 mb-4">
                                {company?.logo ? (
                                    <AvatarImage src={company.logo} alt={company.name} />
                                ) : (
                                    <AvatarFallback>
                                        <Building className="h-20 w-20 text-gray-400" />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            
                            <h1 className="text-2xl font-bold mb-2 text-center">{company?.name}</h1>
                            <div className="text-gray-600 mb-4 text-center">{company?.location || 'No location specified'}</div>
                            
                            {company?.website && (
                                <a 
                                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline mb-4 flex items-center"
                                >
                                    <span className="underline">{company.website}</span>
                                </a>
                            )}
                            
                            <div className="border-t border-gray-200 w-full pt-4 mt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium">Register day:</span>
                                    <span>{formatDate(company?.createdAt)}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="font-medium">Number of job:</span>
                                    <span>{companyJobs.length}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Thông tin chi tiết và danh sách công việc */}
                        <div className="w-full md:w-2/3">
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Company Information</h2>
                            
                            <div className="mb-6">
                                <p className="text-gray-700">
                                    {company?.description || 'Không có mô tả cho công ty này.'}
                                </p>
                            </div>
                            
                            <h2 className="text-xl font-bold mb-4 flex items-center border-b pb-2">
                                <Briefcase className="mr-2 h-5 w-5" />
                                Jobs List
                            </h2>
                            
                            {companyJobs.length === 0 ? (
                                <div className="text-gray-500">This company has not posted any job.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {companyJobs.map(job => (
                                        <div key={job._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between">
                                                <h3 className="font-semibold">{job.title}</h3>
                                                <Badge className="bg-[#007771]">{job.jobType}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">Location: {job.location}</p>
                                            <p className="text-sm text-gray-600">Salary: {job.salary}tr VND</p>
                                            <div className="mt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => navigate(`/description/${job._id}`)}
                                                >
                                                    View Detail
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog xác nhận xóa */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg">Delete Confirm</DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure to delete company {company?.name}? <br />
                            All jobs ({companyJobs.length}) of this company will be deleted. <br />
                            This action can not be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-center gap-4 sm:justify-center">
                        <Button
                            variant="destructive"
                            onClick={handleDeleteCompany}
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
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CompanyDetail