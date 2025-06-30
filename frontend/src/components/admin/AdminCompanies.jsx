import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from '../shared/Navbar'
import { Search, Building, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import useGetAllCompaniesAdmin from '@/hooks/useGetAllCompaniesAdmin'
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

const AdminCompanies = () => {
    const { user } = useSelector(store => store.auth)
    const { companies } = useSelector(store => store.company)
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [searchTimeout, setSearchTimeout] = useState(null)
    const [displayedCompanies, setDisplayedCompanies] = useState([])
    const [allCompanies, setAllCompanies] = useState([])
    
    // Thêm state cho phân trang
    const [currentPage, setCurrentPage] = useState(1)
    const companiesPerPage = 5 // Số công ty trên mỗi trang
    
    // Sử dụng custom hook để lấy danh sách công ty
    const { loading } = useGetAllCompaniesAdmin(search)

    // Chỉ cho phép admin truy cập trang này
    useEffect(() => {
        if (!user) {
            navigate('/login')
        } else if (user.role !== 'admin') {
            navigate('/')
            toast.error('You have no authorization to access this page')
        }
    }, [user, navigate])

    // Cập nhật danh sách công ty khi companies thay đổi
    useEffect(() => {
        if (companies && companies.length > 0) {
            setAllCompanies(companies)
            setCurrentPage(1) // Reset về trang đầu tiên khi có dữ liệu mới
            updateCurrentPageCompanies(companies)
        }
    }, [companies])
    
    // Cập nhật danh sách công ty khi thay đổi trang
    useEffect(() => {
        updateCurrentPageCompanies()
    }, [currentPage])
    
    // Cập nhật danh sách công ty hiển thị dựa trên trang hiện tại
    const updateCurrentPageCompanies = (companyList = allCompanies) => {
        const indexOfLastCompany = currentPage * companiesPerPage
        const indexOfFirstCompany = indexOfLastCompany - companiesPerPage
        setDisplayedCompanies(companyList.slice(indexOfFirstCompany, indexOfLastCompany))
    }
    
    // Chuyển sang trang tiếp theo
    const nextPage = () => {
        if (currentPage < Math.ceil(allCompanies.length / companiesPerPage)) {
            setCurrentPage(currentPage + 1)
        }
    }
    
    // Quay lại trang trước
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

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
            // Tìm kiếm sẽ được thực hiện trong useGetAllCompaniesAdmin hook
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

    // Hàm điều hướng đến trang chi tiết công ty
    const handleViewCompanyDetail = (companyId) => {
        navigate(`/admin/companies-detail/${companyId}`);
    };

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Company Management</h1>
                
                {/* Tiêu đề và số liệu tổng quan */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Total Companies</p>
                            <h3 className="text-2xl font-bold">{companies.length}</h3>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <Building className="h-6 w-6 text-blue-500" />
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

                {/* Hiển thị số lượng công ty tìm thấy */}
                <div className="text-sm text-gray-500 mb-4">
                    Found {companies.length} companies
                    {search ? ` fit "${search}"` : ''}
                </div>

                {/* Bảng danh sách công ty */}
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
                                    <TableHead className="w-[60px]">Logo</TableHead>
                                    <TableHead>Company Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Website</TableHead>
                                    <TableHead>Registered By</TableHead>
                                    <TableHead className="w-[120px]">Register Day</TableHead>
                                    <TableHead className="text-right w-[100px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>                                {displayedCompanies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center">No data for this company</TableCell>
                                    </TableRow>
                                ) : (
                                    displayedCompanies.map((company, index) => (                                        <TableRow key={company._id}>
                                            <TableCell>{(currentPage - 1) * companiesPerPage + index + 1}</TableCell>
                                            <TableCell>
                                                <Avatar>
                                                    <AvatarImage src={company.logo} alt={company.name} />
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">{company.name}</TableCell>
                                            <TableCell>{company.location || "--"}</TableCell>
                                            <TableCell>
                                                {company.website ? (
                                                    <a 
                                                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {company.website}
                                                    </a>
                                                ) : (
                                                    "--"
                                                )}
                                            </TableCell>
                                            <TableCell>{company.userId?.fullname || "--"}</TableCell>
                                            <TableCell>{formatDate(company.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleViewCompanyDetail(company._id)}
                                                    className="hover:bg-[#007771] hover:text-white flex items-center gap-1"
                                                    title="View details"
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
                        {allCompanies.length > 0 && (
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
                                        {Array.from({ length: Math.ceil(allCompanies.length / companiesPerPage) }, (_, i) => i + 1).map((pageNum) => (
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
                                        disabled={currentPage >= Math.ceil(allCompanies.length / companiesPerPage)}
                                        className="flex items-center gap-1"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                <div className="text-sm text-gray-500 order-1 sm:order-2">
                                    Showing {((currentPage - 1) * companiesPerPage) + 1} to {Math.min(currentPage * companiesPerPage, allCompanies.length)} of {allCompanies.length} companies
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminCompanies