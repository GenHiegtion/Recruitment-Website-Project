import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { BookmarkCheck, LogOut, LayoutDashboard, Building, Home, Briefcase, User2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    return (
        <div className='bg-white'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-24'>
                <div>
                    <h1 className='text-2xl font-bold'>Job<span className='text-[#14AE5C]'>Hunter</span></h1>
                </div>
                <div className='flex items-center gap-12'>
                    <ul className='flex font-medium items-center gap-5'>
                        {
                            user && user.role === 'admin' ? (
                                <>
                                    <li><Link to="/" className="flex items-center gap-1"><Home size={18} /> Home</Link></li>
                                    <li><Link to="/admin/dashboard" className="flex items-center gap-1"><LayoutDashboard size={18} /> Dashboard</Link></li>
                                    <li><Link to="/admin/companies-all" className="flex items-center gap-1"><Building size={18} /> Company</Link></li>
                                    <li><Link to="/admin/all-jobs" className="flex items-center gap-1"><Briefcase size={18} /> Job</Link></li>
                                </>                            ) : user && user.role === 'recruiter' ? (                                <>
                                    <li><Link to="/" className="flex items-center gap-1"><Home size={18} /> Home</Link></li>
                                    <li><Link to="/admin/companies" className="flex items-center gap-1"><Building size={18} /> Companies</Link></li>
                                    <li><Link to="/admin/jobs" className="flex items-center gap-1"><Briefcase size={18} /> Jobs</Link></li>
                                </>                            ) : (
                                <>
                                    <li><Link to="/" className="flex items-center gap-1"><Home size={18} /> Home</Link></li>
                                    <li><Link to="/jobs" className="flex items-center gap-1"><Briefcase size={18} /> Jobs</Link></li>
                                    <li><Link to="/browse" className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="3"/></svg> Browse</Link></li>
                                    {user && <li><Link to="/saved-jobs" className="flex items-center gap-1"><BookmarkCheck size={18} /> Saved Jobs</Link></li>}
                                </>
                            )
                        }
                    </ul>
                    {
                        !user ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login"><Button variant='outline'>Login</Button></Link>
                                <Link to="/signup"><Button className="bg-[#007771] hover:bg-[#14AE5C]">Signup</Button></Link>
                            </div>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className="cursor-pointer">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className="w-64">
                                    <div className='space-y-4'>
                                        {/* User info section */}
                                        <div className='flex items-center gap-3 pb-2 border-b'>
                                            <Avatar>
                                                <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                            </Avatar>
                                            <div>
                                                <h4 className='font-medium'>{user?.fullname}</h4>
                                                <p className='text-xs text-muted-foreground'>{user?.email}</p>
                                                <span className='text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700 mt-1 inline-block capitalize'>{user?.role}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Navigation links section */}
                                        <div className='space-y-1 text-gray-600'>
                                            {/* Admin links */}
                                            {user && user.role === 'admin' && (
                                                <>
                                                    <Link to="/" className='flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors'>
                                                        <Home size={16} />
                                                        <span>Home</span>
                                                    </Link>
                                                    <Link to="/admin/profile" className='flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors'>
                                                        <User2 size={16} />
                                                        <span>My Profile</span>
                                                    </Link>
                                                </>
                                            )}
                                            
                                            {/* Applicant links */}
                                            {user && user.role === 'applicant' && (
                                                <>
                                                    <Link to="/profile" className='flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors'>
                                                        <User2 size={16} />
                                                        <span>My Profile</span>
                                                    </Link>
                                                    <Link to="/saved-jobs" className='flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors'>
                                                        <BookmarkCheck size={16} />
                                                        <span>Saved Jobs</span>
                                                    </Link>
                                                </>
                                            )}
                                            
                                            {/* Recruiter links */}
                                            {user && user.role === 'recruiter' && (
                                                <>
                                                    <Link to="/admin/companies" className='flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors'>
                                                        <Building size={16} />
                                                        <span>Companies</span>
                                                    </Link>
                                                    <Link to="/admin/jobs" className='flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors'>
                                                        <Briefcase size={16} />
                                                        <span>Jobs</span>
                                                    </Link>
                                                </>
                                            )}
                                            
                                            {/* Logout button - common for all roles */}
                                            <div className='pt-2 border-t'>
                                                <button
                                                    onClick={logoutHandler}
                                                    className='flex items-center gap-2 p-2 w-full text-left hover:bg-gray-100 rounded-md text-red-600 transition-colors'
                                                >
                                                    <LogOut size={16} />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Navbar