import { Building, Briefcase, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

const AdminHeroSection = () => {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <div className='text-center mb-16'>
        <span className='inline-block px-4 py-2 rounded-full bg-gray-100 text-[#14AE5C] font-medium mb-4'>Admin Dashboard</span>
        <h1 className='text-4xl md:text-5xl font-bold mb-6'>Welcome <span className='text-[#007771]'>Hunter</span> Chrollo</h1>
        <p className='text-xl text-gray-600 max-w-3xl mx-auto'>Manage your platform efficiently</p>
        <p className='text-xl text-gray-600 max-w-3xl mx-auto'>Control users, companies, and job listings all in one place.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        <Link to="/admin/dashboard" className='group'>
          <div className='bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-[#007771]/20 h-full flex flex-col'>
            <div className='bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-blue-100'>
              <Users className='h-8 w-8 text-[#007771]' />
            </div>
            <h2 className='text-xl font-bold mb-3'>User Management</h2>
            <p className='text-gray-600 mb-6 flex-grow'>Review and manage all registered users on the platform. Control access and permissions.</p>
            <Button variant="outline" className='w-full group-hover:bg-[#007771] group-hover:text-white'>Manage Users</Button>
          </div>
        </Link>

        <Link to="/admin/companies-all" className='group'>
          <div className='bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-[#007771]/20 h-full flex flex-col'>
            <div className='bg-green-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-green-100'>
              <Building className='h-8 w-8 text-[#007771]' />
            </div>
            <h2 className='text-xl font-bold mb-3'>Company Management</h2>
            <p className='text-gray-600 mb-6 flex-grow'>Oversee all registered companies, approve profiles, and manage company information.</p>
            <Button variant="outline" className='w-full group-hover:bg-[#007771] group-hover:text-white'>Manage Companies</Button>
          </div>
        </Link>

        <Link to="/admin/all-jobs" className='group'>
          <div className='bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-[#007771]/20 h-full flex flex-col'>
            <div className='bg-amber-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-amber-100'>
              <Briefcase className='h-8 w-8 text-[#007771]' />
            </div>
            <h2 className='text-xl font-bold mb-3'>Job Management</h2>
            <p className='text-gray-600 mb-6 flex-grow'>Monitor and control all job postings across the platform. Review, edit or remove inappropriate content.</p>
            <Button variant="outline" className='w-full group-hover:bg-[#007771] group-hover:text-white'>Manage Jobs</Button>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default AdminHeroSection;