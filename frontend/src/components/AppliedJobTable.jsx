import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { APPLICATION_API_END_POINT } from '@/utils/constant'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { removeAppliedJob } from '@/redux/jobSlice'

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    
    const handleCancelApplication = async () => {
        if (!selectedJob) return;
        
        try {
            setIsLoading(true);
            const res = await axios.delete(`${APPLICATION_API_END_POINT}/cancel/${selectedJob.job._id}`, { 
                withCredentials: true 
            });
            
            if (res.data.success) {
                toast.success(res.data.message || 'Application cancelled successfully');
                dispatch(removeAppliedJob(selectedJob._id));
                setIsDialogOpen(false);
            }
        } catch (error) {
            console.error('Error cancelling application:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel application');
        } finally {
            setIsLoading(false);
        }
    };

    const openCancelDialog = (job) => {
        setSelectedJob(job);
        setIsDialogOpen(true);
    };
    
    return (
        <div>
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        allAppliedJobs.length <= 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">You haven't applied to any job yet.</TableCell>
                            </TableRow>
                        ) : allAppliedJobs.map((appliedJob) => (                            <TableRow key={appliedJob._id}>
                                <TableCell>{appliedJob?.createdAt ? appliedJob.createdAt.split("T")[0] : "N/A"}</TableCell>
                                <TableCell>{appliedJob.job?.title}</TableCell>
                                <TableCell>{appliedJob.job?.company?.name}</TableCell>
                                <TableCell>
                                    <Badge className={`${
                                        appliedJob?.status === "rejected" ? 'bg-red-400' : 
                                        appliedJob.status === 'pending' ? 'bg-gray-400' : 'bg-green-400'
                                    }`}>
                                        {appliedJob.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        disabled={appliedJob.status !== 'pending'} 
                                        onClick={() => openCancelDialog(appliedJob)}
                                        className={`text-red-600 hover:text-red-800 border-red-300 hover:border-red-600 ${
                                            appliedJob.status !== 'pending' ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
            
            {/* Application cancellation confirmation dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg">Cancel Application</DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure you want to cancel your application for {selectedJob?.job?.title} at {selectedJob?.job?.company?.name}?
                            <br />
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-center gap-4 sm:justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={isLoading}
                        >
                            No, Keep Application
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelApplication}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                        >
                            {isLoading ? 'Cancelling...' : 'Yes, Cancel Application'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AppliedJobTable