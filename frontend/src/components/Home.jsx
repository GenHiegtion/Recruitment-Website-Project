import { useEffect } from 'react'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
import CategoryCarousel from './CategoryCarousel'
import LatestJobs from './LatestJobs'
import Footer from './shared/Footer'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import AdminHeroSection from './admin/AdminHeroSection'
import RecruiterHeroSection from './admin/RecruiterHeroSection'

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  
  // Kiểm tra nếu người dùng là admin
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow py-8">
          <AdminHeroSection />
        </div>
        <Footer />
      </div>
    )
  }
  
  // Kiểm tra nếu người dùng là recruiter
  if (user?.role === 'recruiter') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow py-8">
          <RecruiterHeroSection />
        </div>
        <Footer />
      </div>
    )
  }
    // Người dùng thông thường hoặc chưa đăng nhập
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <HeroSection />
        <CategoryCarousel />
        <LatestJobs />
      </div>
      <Footer />
    </div>
  )
}

export default Home