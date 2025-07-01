import { setAllAdminJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

const useGetAllJobsAdmin = (searchKeyword = '') => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    
    useEffect(() => {
        const fetchAllJobsAdmin = async () => {
            try {
                setLoading(true)
                
                // Create query string for searching
                let url = `${JOB_API_END_POINT}/get-all-jobs`
                if (searchKeyword) {
                    url += `?keyword=${encodeURIComponent(searchKeyword)}`
                }
                
                const res = await axios.get(url, { withCredentials: true })
                
                if (res.data.success) {
                    dispatch(setAllAdminJobs(res.data.jobs))
                } else {
                    toast.error(res.data.message || 'Unable to load jobs list')
                }
            } catch (error) {
                console.error('Error fetching all jobs for admin:', error)
                toast.error(error.response?.data?.message || 'Fail to load jobs list')
            } finally {
                setLoading(false)
            }
        }
        
        fetchAllJobsAdmin()
    }, [dispatch, searchKeyword])
    
    return { loading }
}

export default useGetAllJobsAdmin