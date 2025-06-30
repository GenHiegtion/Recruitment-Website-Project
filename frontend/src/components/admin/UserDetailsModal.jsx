import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { CalendarIcon, Mail, Phone, Trash2 } from 'lucide-react';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

const UserDetailsModal = ({ isOpen, onClose, userData, onUserDeleted }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!userData) return null;
  
  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(`${USER_API_END_POINT}/delete/${userData._id}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        let message = `Deleted user ${userData.fullname}`;
        
        // Hiển thị thông tin chi tiết về dữ liệu đã bị xóa
        if (userData.role === 'recruiter') {
          message += ` and ${response.data.deletedData.companies} company, ${response.data.deletedData.jobs} job, ${response.data.deletedData.applications} relevant application`;
        } else if (userData.role === 'applicant') {
          message += ` and ${response.data.deletedData.applications} application`;
        }
        
        toast.success(message);
        
        // Đóng dialog và thông báo cho component cha rằng user đã bị xóa
        closeDeleteDialog();
        onClose();
        
        // Gọi callback để cập nhật danh sách user
        if (onUserDeleted) {
          onUserDeleted();
        }
      } else {
        toast.error('Unable to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Fail to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">User Information</DialogTitle>
            <DialogDescription className="text-center">
              Account Detail Of {userData.fullname}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 p-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userData?.profile?.profilePhoto || ""} alt={userData.fullname} />
            </Avatar>
            <h3 className="font-bold text-xl">{userData.fullname}</h3>
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              userData.role === 'admin' 
              ? 'bg-red-100 text-red-800' 
              : userData.role === 'recruiter' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
            }`}>
              {userData.role}
            </span>
          </div>

          <div className="space-y-4 p-4 pt-0">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-500" />
              <span>{userData.email}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-gray-500" />
              <span>{userData.phoneNumber}</span>
            </div>

            {userData.profile?.bio && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Introduction</h4>
                <p className="text-gray-700">{userData.profile.bio}</p>
              </div>
            )}

            {userData.profile?.skills && userData.profile.skills.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {userData.profile.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {userData.role === 'applicant' && userData.profile?.resume && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">CV</h4>
                <a 
                  href={userData.profile.resume} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 flex items-center gap-2"
                >
                  Xem CV {userData.profile.resumeOriginalName && `(${userData.profile.resumeOriginalName})`}
                </a>
              </div>
            )}

            <div className="border-t pt-4 mt-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <span>Join: {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('vi-VN') : "N/A"}</span>
            </div>
            
            {/* Di chuyển nút xóa lên trên và thay đổi kích thước để dễ nhìn thấy hơn */}
            {userData.role !== 'admin' && (
              <div className="border-t pt-4 mt-4 sticky bottom-0">
                <Button
                  variant="destructive"
                  size="default"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={openDeleteDialog}
                >
                  <Trash2 size={18} />
                  Delete User
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa user */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">Delete Confirm</DialogTitle>
            <DialogDescription className="text-center">
              {userData.role === 'recruiter' ? (
                <>
                  Are you sure to delete user {userData.fullname}? <br />
                  All companies, jobs và relevant application will be deleted. <br />
                </>
              ) : (
                <>
                  Are you sure to delete user {userData.fullname}? <br />
                  All application of this user will be deleted too. <br />
                </>
              )}
              This action can not be done.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center gap-4 sm:justify-center">
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
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
    </>
  );
};

export default UserDetailsModal;