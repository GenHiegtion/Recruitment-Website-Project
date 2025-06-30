import { Building, Briefcase, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';

const RecruiterHeroSection = () => {
  const { user } = useSelector(store => store.auth);

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <div className='text-center mb-16'>
        <span className='inline-block px-4 py-2 rounded-full bg-gray-100 text-[#14AE5C] font-medium mb-4'>Recruiter Dashboard</span>
        <h1 className='text-4xl md:text-5xl font-bold mb-6'>Welcome <span className='text-[#007771]'>{user?.fullname || 'Recruiter'}</span></h1>
        <p className='text-xl text-gray-600 max-w-3xl mx-auto'>Manage your recruitment process efficiently</p>
        <p className='text-xl text-gray-600 max-w-3xl mx-auto'>Post jobs, review applications, and connect with potential candidates.</p>
      </div>      <div className='flex justify-center'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl'>
          <Link to="/admin/companies" className='group'>
            <div className='bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-[#007771]/20 h-full flex flex-col'>
              <div className='bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-blue-100'>
                <Building className='h-8 w-8 text-[#007771]' />
              </div>
              <h2 className='text-xl font-bold mb-3'>Company Profile</h2>
              <p className='text-gray-600 mb-6 flex-grow'>Manage your company profile, update information, and improve your employer branding.</p>
              <Button variant="outline" className='w-full group-hover:bg-[#007771] group-hover:text-white'>Manage Companies</Button>
            </div>
          </Link>

          <Link to="/admin/jobs" className='group'>
            <div className='bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-[#007771]/20 h-full flex flex-col'>
              <div className='bg-green-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-green-100'>
                <Briefcase className='h-8 w-8 text-[#007771]' />
              </div>
              <h2 className='text-xl font-bold mb-3'>Jobs List</h2>
              <p className='text-gray-600 mb-6 flex-grow'>View and manage your active job postings. Track application status and edit job details.</p>
              <Button variant="outline" className='w-full group-hover:bg-[#007771] group-hover:text-white'>Manage Jobs</Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RecruiterHeroSection
