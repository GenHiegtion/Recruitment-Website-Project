import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Home from './components/Home'
import Jobs from './components/Jobs'
import JobDescription from './components/JobDescription'
import Browse from './components/Browse'
import Profile from './components/Profile'
import SavedJobs from './components/SavedJobs'
import Companies from './components/admin/Companies'
import CompanyCreate from './components/admin/CompanyCreate'
import CompanySetup from './components/admin/CompanySetup'
import AdminJobs from "./components/admin/RecruiterJobs";
import PostJob from './components/admin/PostJob'
import JobEdit from './components/admin/JobEdit'
import Applicants from './components/admin/Applicants'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminCompanies from './components/admin/AdminCompanies'
import AdminAllJobs from "./components/admin/AdminAllJobs";
import AdminProfile from './components/admin/AdminProfile'
import CompanyDetail from './components/admin/CompanyDetail'

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: "/jobs",
    element: <Jobs />
  },
  {
    path: "/description/:id",
    element: <JobDescription />
  },
  {
    path: "/browse",
    element: <Browse />
  },
  {
    path: "/profile",
    element: <Profile />
  },
  {
    path: "/saved-jobs",
    element: <SavedJobs />
  },
  // Admin Dashboard routes - Chỉ dành cho admin
  {
    path: "/admin/dashboard",
    element: <ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>
  },
  {
    path: "/admin/companies-all",
    element: <ProtectedRoute adminOnly={true}><AdminCompanies /></ProtectedRoute>
  },
  {
    path: "/admin/companies-detail/:id",
    element: <ProtectedRoute><CompanyDetail /></ProtectedRoute>
  },
  // Thêm route mới cho admin xem tất cả job
  {
    path: "/admin/all-jobs",
    element: <ProtectedRoute adminOnly={true}><AdminAllJobs /></ProtectedRoute>
  },
  // Thêm route mới cho admin profile
  {
    path: "/admin/profile",
    element: <ProtectedRoute adminOnly={true}><AdminProfile /></ProtectedRoute>
  },
  // Routes dành cho cả admin và recruiter
  {
    path: "/admin/companies",
    element: <ProtectedRoute><Companies /></ProtectedRoute>
  },
  {
    path: "/admin/companies/create",
    element: <ProtectedRoute><CompanyCreate /></ProtectedRoute>
  },
  {
    path: "/admin/companies/:id",
    element: <ProtectedRoute><CompanySetup /></ProtectedRoute>
  },
  {
    path: "/admin/jobs",
    element: <ProtectedRoute><AdminJobs /></ProtectedRoute>
  },
  {
    path: "/admin/jobs/create",
    element: <ProtectedRoute><PostJob /></ProtectedRoute>
  },
  {
    path: "/admin/jobs/:id",
    element: <ProtectedRoute><JobEdit /></ProtectedRoute>
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: <ProtectedRoute><Applicants /></ProtectedRoute>
  }
])

function App() {
  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App