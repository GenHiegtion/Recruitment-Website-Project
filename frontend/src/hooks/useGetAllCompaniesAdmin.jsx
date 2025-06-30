import { setCompanies } from '@/redux/companySlice'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'

const useGetAllCompaniesAdmin = (search = '') => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const { user } = useSelector(store => store.auth)
    
    useEffect(() => {
        const fetchAllCompanies = async () => {
            // Chỉ thực hiện khi đã đăng nhập và là admin
            if (!user || user.role !== 'admin') return
            
            try {
                setLoading(true)
                // Xây dựng URL với tham số tìm kiếm nếu có
                let url = `${COMPANY_API_END_POINT}/all`
                if (search) {
                    url += `?search=${search}`
                }
                
                const res = await axios.get(url, { 
                    withCredentials: true 
                })
                
                if (res.data.success) {
                    // Cập nhật state global với danh sách công ty
                    dispatch(setCompanies(res.data.companies))
                }
            } catch (error) {
                console.error('Error fetching companies:', error)
                toast.error('Unable to load companies list')
            } finally {
                setLoading(false)
            }
        }
        
        fetchAllCompanies()
    }, [dispatch, search, user])
    
    return { loading }
}

export default useGetAllCompaniesAdmin