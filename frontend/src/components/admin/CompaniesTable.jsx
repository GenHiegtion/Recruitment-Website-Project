import { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Edit2, MoreHorizontal, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { COMPANY_API_END_POINT } from '@/utils/constant'

const CompaniesTable = () => {
    const { companies, searchCompanyByText } = useSelector(store => store.company);
    const [filterCompany, setFilterCompany] = useState(companies);
    const navigate = useNavigate();
    
    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [companiesPerPage] = useState(5);
    
    // State for company delete dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState(null);

    useEffect(() => {
        const filteredCompany = companies.length >= 0 && companies.filter((company) => {
            if (!searchCompanyByText) {
                return true
            };
            return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());

        });
        setFilterCompany(filteredCompany);
    }, [companies, searchCompanyByText])    // Get companies for current page
    const indexOfLastCompany = currentPage * companiesPerPage;
    const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
    const currentCompanies = filterCompany ? filterCompany.slice(indexOfFirstCompany, indexOfLastCompany) : [];

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Go to next page
    const nextPage = () => {
        if (currentPage < Math.ceil((filterCompany?.length || 0) / companiesPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };    // Go back to previous page
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    // Handle company deletion
    const handleDeleteCompany = async () => {
        if (!companyToDelete) return;
        
        try {
            setIsDeleting(true);
            const response = await axios.delete(`${COMPANY_API_END_POINT}/delete/${companyToDelete._id}`, {
                withCredentials: true
            });
            
            if (response.data.success) {
                // Update state to display list without the just deleted company
                setFilterCompany(prevCompanies => 
                    prevCompanies.filter(company => company._id !== companyToDelete._id)
                );
                
                toast.success(`Deleted company ${companyToDelete.name} and ${response.data.deletedJobsCount || 0} relevant jobs`);
                
                // If current page has no companies left after deletion and it's not the first page
                // then go back to previous page
                if (currentCompanies.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } else {
                toast.error('Unable to delete company');
            }
        } catch (error) {
            console.error('Error deleting company:', error);
            toast.error(error.response?.data?.message || 'Fail to delete company');
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setCompanyToDelete(null);
        }
    };
    
    return (
        <div className="overflow-x-auto">
            <Table className="min-w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Logo</TableHead>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead className="w-[150px]">Date</TableHead>
                        <TableHead className="w-[150px]">Detail</TableHead>
                        <TableHead className="w-[100px] text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        currentCompanies?.map((company) => (
                            <tr key={company._id}>                                <TableCell className="w-[80px]">
                                    <Avatar>
                                        <AvatarImage src={company.logo} />
                                    </Avatar>
                                </TableCell>
                                <TableCell className="w-[200px]">{company.name}</TableCell>
                                <TableCell className="w-[150px]">{company.createdAt ? company.createdAt.split("T")[0] : "N/A"}</TableCell>
                                <TableCell className="w-[150px]">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => navigate(`/admin/companies-detail/${company._id}`)}
                                        className="hover:bg-[#007771] hover:text-white flex items-center gap-1"
                                        title="View details"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                </TableCell>                                <TableCell className="w-[100px] text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                        <PopoverContent className="w-32">
                                            <div onClick={() => navigate(`/admin/companies/${company._id}`)} className='flex items-center gap-2 w-fit cursor-pointer'>
                                                <Edit2 className='w-4' />
                                                <span>Edit</span>
                                            </div>
                                            <div 
                                                onClick={() => {
                                                    setCompanyToDelete(company);
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
            </Table>            {/* Pagination */}
            {filterCompany && filterCompany.length > 0 && (
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
                            {Array.from({ length: Math.ceil((filterCompany?.length || 0) / companiesPerPage) }, (_, i) => i + 1).map((pageNum) => (
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
                            disabled={currentPage >= Math.ceil((filterCompany?.length || 0) / companiesPerPage)}
                            className="flex items-center gap-1"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="text-sm text-gray-500 order-1 sm:order-2">
                        Showing {((currentPage - 1) * companiesPerPage) + 1} to {Math.min(currentPage * companiesPerPage, filterCompany.length)} of {filterCompany.length} companies
                    </div>
                </div>            )}
            
            {/* Delete confirmation dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg">Delete Confirm</DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure to delete company {companyToDelete?.name}? <br />
                            All relavant jobs to this company will be deleted too. <br />
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

export default CompaniesTable