import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { Eye, Info, Search, UserCog, Building, Briefcase, Book, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '../ui/input'
import UserDetailsModal from './UserDetailsModal'
import { 
    Table, 
    TableBody, 
    TableCaption, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../ui/table'

const AdminDashboard = () => {
    const { user } = useSelector(store => store.auth)
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [allUsers, setAllUsers] = useState([]) // Store all users
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [searchTimeout, setSearchTimeout] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false)
    const [userStats, setUserStats] = useState({
        total: 0,
        applicants: 0,
        recruiters: 0
    })
    
    // Added state for pagination
    const [currentPage, setCurrentPage] = useState(1)
    const usersPerPage = 5 // Number of users per page

    // Only allow admin to access this page
    useEffect(() => {
        if (!user) {
            navigate('/login')
        } else if (user.role !== 'admin') {
            navigate('/')
            toast.error('You have no authorization to access this page')
        }
    }, [user, navigate])

    // Get list of all users
    const fetchUsers = async () => {
        try {
            setLoading(true)
            let url = `${USER_API_END_POINT}/all`
            
            // Build query params
            const params = new URLSearchParams()
            
            // Apply role filter if not "all"
            if (filter !== 'all') {
                params.append('role', filter)
            }
            
            // Add search parameter if available
            if (search.trim()) {
                params.append('search', search.trim())
            }
            
            // Add query params to URL
            const queryString = params.toString()
            if (queryString) {
                url += `?${queryString}`
            }
            
            const response = await axios.get(url, {
                withCredentials: true
            })
              if (response.data.success) {
                const fetchedUsers = response.data.users
                setAllUsers(fetchedUsers)
                
                // Update statistics
                if (filter === 'all') {
                    const stats = {
                        total: fetchedUsers.length,
                        applicants: fetchedUsers.filter(u => u.role === 'applicant').length,
                        recruiters: fetchedUsers.filter(u => u.role === 'recruiter').length
                    }
                    setUserStats(stats)
                }
                
                // Reset to first page when new results are available
                setCurrentPage(1)
                
                // Display users of the first page
                updateCurrentPageUsers(fetchedUsers)
            }
        } catch (error) {
            console.error("Fail to get users list:", error)
            toast.error("Fail to load users list")
        } finally {
            setLoading(false)
        }
    }    // Call API when filter or search changes
    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchUsers()
        }
    }, [user, filter])
    
    // Update user list when page changes
    useEffect(() => {
        updateCurrentPageUsers()
    }, [currentPage])

    // Handle search with debounce
    const handleSearch = (e) => {
        const searchTerm = e.target.value
        setSearch(searchTerm)
        
        // Clear previous timeout if exists
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }
          // Create new timeout to delay search
        const timeout = setTimeout(() => {
            fetchUsers()
        }, 500) // Wait 500ms after stopping typing
        
        setSearchTimeout(timeout)
    }

    // Handle filter by role
    const handleFilterChange = (role) => {
        setFilter(role)
    }
      // Handle opening detailed information modal
    const handleViewUserDetails = (userData) => {
        setSelectedUser(userData)
        setIsUserDetailsModalOpen(true)
    }
    
    // Update displayed user list based on current page
    const updateCurrentPageUsers = (usersList = allUsers) => {
        const indexOfLastUser = currentPage * usersPerPage
        const indexOfFirstUser = indexOfLastUser - usersPerPage
        setUsers(usersList.slice(indexOfFirstUser, indexOfLastUser))
    }
    
    // Go to next page
    const nextPage = () => {
        if (currentPage < Math.ceil(allUsers.length / usersPerPage)) {
            setCurrentPage(currentPage + 1)
        }
    }
    
    // Go back to previous page
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">User Management</h1>
                
                {/* Statistics table */}
                {filter === 'all' && !search && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Users</p>
                                    <h3 className="text-2xl font-bold">{userStats.total}</h3>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-full">
                                    <UserCog className="h-6 w-6 text-yellow-500" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-500 text-sm">Applicant</p>
                                    <h3 className="text-2xl font-bold">{userStats.applicants}</h3>
                                </div>
                                <div className="bg-green-50 p-3 rounded-full">
                                    <Info className="h-6 w-6 text-green-500" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-500 text-sm">Recruiter</p>
                                    <h3 className="text-2xl font-bold">{userStats.recruiters}</h3>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-full">
                                    <Info className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                    {/* Tabs filter by role */}
                    <div className="flex gap-2">
                        <Button 
                            variant={filter === "all" ? "default" : "outline"}
                            onClick={() => handleFilterChange("all")}
                        >
                            All
                        </Button>
                        <Button 
                            variant={filter === "applicant" ? "default" : "outline"}
                            onClick={() => handleFilterChange("applicant")}
                        >
                            Applicant
                        </Button>
                        <Button 
                            variant={filter === "recruiter" ? "default" : "outline"}
                            onClick={() => handleFilterChange("recruiter")}
                        >
                            Recruiter
                        </Button>
                    </div>
                    
                    {/* Search box */}
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
                </div>                {/* Display number of users found */}
                <div className="text-sm text-gray-500 mb-4">
                    Found {allUsers.length} users {filter !== 'all' ? `role ${filter}` : ''}
                    {search ? ` fit "${search}"` : ''}
                </div>

                {/* Users list table */}
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
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead className="w-[100px]">Role</TableHead>
                                    <TableHead className="w-[150px]">Day created</TableHead>
                                    <TableHead className="w-[100px]">User Info</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">No data</TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((userData, index) => (
                                        <TableRow key={userData._id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{userData.fullname}</TableCell>
                                            <TableCell>{userData.email}</TableCell>
                                            <TableCell>{userData.phoneNumber}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    userData.role === 'admin' 
                                                    ? 'bg-red-100 text-red-800' 
                                                    : userData.role === 'recruiter' 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-green-100 text-green-800'                                                }`}>
                                                    {userData.role}
                                                </span>
                                            </TableCell>
                                            <TableCell>{userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleViewUserDetails(userData)}
                                                    className="flex items-center gap-1 bg-white text-gray-700 hover:bg-[#007771] hover:text-white transition-colors"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Detail
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>                        </Table>                        {/* Add pagination */}
                        {allUsers.length > 0 && (
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
                                        {Array.from({ length: Math.ceil(allUsers.length / usersPerPage) }, (_, i) => i + 1).map((pageNum) => (
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
                                        disabled={currentPage >= Math.ceil(allUsers.length / usersPerPage)}
                                        className="flex items-center gap-1"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                <div className="text-sm text-gray-500 order-1 sm:order-2">
                                    Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, allUsers.length)} of {allUsers.length} users
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* User details modal */}
                <UserDetailsModal
                    isOpen={isUserDetailsModalOpen}
                    onClose={() => setIsUserDetailsModalOpen(false)}
                    userData={selectedUser}
                    onUserDeleted={fetchUsers}  // Call fetchUsers function when user is deleted
                />
            </div>
            <div className='max-w-7xl mx-auto my-10 px-24'>
                <h1 className='text-3xl font-bold mb-10'>Admin Dashboard</h1>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    {/* Company management */}
                    <div
                        onClick={() => navigate('/admin/companies-all')}
                        className='p-6 border border-gray-200 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all bg-white'
                    >
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-xl font-bold'>Company Management</h2>
                            <Building className='w-8 h-8 text-[#007771]' />
                        </div>
                        <p className='text-gray-600'>Manage all companies in the system</p>
                    </div>

                    {/* Job management */}
                    <div
                        onClick={() => navigate('/admin/all-jobs')}
                        className='p-6 border border-gray-200 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all bg-white'
                    >
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-xl font-bold'>Job Management</h2>
                            <Briefcase className='w-8 h-8 text-[#007771]' />
                        </div>
                        <p className='text-gray-600'>Manage all jobs in the system</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard