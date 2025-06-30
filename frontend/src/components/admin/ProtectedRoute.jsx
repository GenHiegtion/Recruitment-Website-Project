import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = ({ children, adminOnly }) => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (user === null) {
            // Nếu chưa đăng nhập, chuyển hướng về trang login
            navigate("/login");
            toast.error("Please login to access this page");
            return;
        }
        
        if (adminOnly && user.role !== 'admin') {
            // Nếu route yêu cầu quyền admin nhưng người dùng không phải admin
            navigate("/");
            toast.error("You do not have authorization to access this page");
            return;
        }
        
        if (!adminOnly && user.role !== 'recruiter' && user.role !== 'admin') {
            // Nếu route không yêu cầu quyền admin nhưng người dùng không phải recruiter hoặc admin
            navigate("/");
            toast.error("You do not have authorization to access this page");
            return;
        }
    }, [user, navigate, adminOnly]);

    // Nếu người dùng chưa đăng nhập, không hiển thị gì cả
    if (!user) return null;

    // Nếu adminOnly = true và người dùng không phải admin, không hiển thị gì cả
    if (adminOnly && user.role !== 'admin') return null;

    // Nếu !adminOnly và người dùng không phải recruiter hoặc admin, không hiển thị gì cả
    if (!adminOnly && user.role !== 'recruiter' && user.role !== 'admin') return null;

    // Hiển thị nội dung của route
    return <>{children}</>;
};

export default ProtectedRoute;