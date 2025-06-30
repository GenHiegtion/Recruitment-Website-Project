import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { PenIcon } from 'lucide-react'
import { Badge } from '../ui/badge'
import AdminUpdateProfileDialog from './AdminUpdateProfileDialog'

const AdminProfile = () => {
  const { user } = useSelector(store => store.auth)
  const [updateProfileOpen, setUpdateProfileOpen] = useState(false)

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md my-12'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>Admin Profile</h1>
        <Button 
          onClick={() => setUpdateProfileOpen(true)} 
          className='flex items-center gap-2 bg-[#007771] hover:bg-[#14AE5C]'
        >
          <PenIcon size={16} />
          Edit Profile
        </Button>
      </div>

      {/* Profile Content */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {/* Avatar and Contact */}
        <div className='flex flex-col items-center space-y-4'>
          <Avatar className='h-40 w-40'>
            <AvatarImage src={user?.profile?.profilePhoto || 'https://github.com/shadcn.png'} alt='profile photo' />
          </Avatar>
          <div className='text-center'>
            <h2 className='text-xl font-semibold'>{user?.fullname}</h2>
            <Badge className='bg-[#007771] hover:bg-[#14AE5C] mt-2'>{user?.role}</Badge>
          </div>
          <div className='space-y-2 w-full text-sm'>
            <div className='flex justify-between w-full'>
              <span className='font-medium'>Email:</span>
              <span className='text-gray-600'>{user?.email}</span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='font-medium'>Phone:</span>
              <span className='text-gray-600'>{user?.phoneNumber || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Bio and Skills */}
        <div className='md:col-span-2 space-y-6'>
          <div>
            <h3 className='text-lg font-semibold mb-2 border-b pb-2'>About</h3>
            <p className='text-gray-600'>{user?.profile?.bio || 'No bio information provided.'}</p>
          </div>
          <div>
            <h3 className='text-lg font-semibold mb-2 border-b pb-2'>Skills</h3>
            <div className='flex flex-wrap gap-2'>
              {user?.profile?.skills && user.profile.skills.length > 0 ? (
                user.profile.skills.map((skill, index) => (
                  <Badge key={index} variant='outline' className='bg-gray-100'>{skill}</Badge>
                ))
              ) : (
                <p className='text-gray-600'>No skills listed.</p>
              )}
            </div>
          </div>
          <div>
            <h3 className='text-lg font-semibold mb-2 border-b pb-2'>Role & Permissions</h3>
            <p className='text-gray-600'>As an administrator, I have full access to manage the platform, including companies, jobs, and users.</p>
          </div>
        </div>
      </div>

      {/* Update Profile Dialog */}
      <AdminUpdateProfileDialog open={updateProfileOpen} setOpen={setUpdateProfileOpen} />
    </div>
  )
}

export default AdminProfile