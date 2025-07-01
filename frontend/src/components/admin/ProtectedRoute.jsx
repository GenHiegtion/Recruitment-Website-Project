import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = ({ children, adminOnly }) => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (user === null) {
            // If not logged in, redirect to login page
            navigate("/login");
            toast.error("Please login to access this page");
            return;
        }
        
        if (adminOnly && user.role !== 'admin') {
            // If route requires admin privileges but user is not admin
            navigate("/");
            toast.error("You do not have authorization to access this page");
            return;
        }
        
        if (!adminOnly && user.role !== 'recruiter' && user.role !== 'admin') {
            // If route doesn't require admin privileges but user is not recruiter or admin
            navigate("/");
            toast.error("You do not have authorization to access this page");
            return;
        }
    }, [user, navigate, adminOnly]);

    // If user is not logged in, don't display anything
    if (!user) return null;

    // If adminOnly = true and user is not admin, don't display anything
    if (adminOnly && user.role !== 'admin') return null;

    // If !adminOnly and user is not recruiter or admin, don't display anything
    if (!adminOnly && user.role !== 'recruiter' && user.role !== 'admin') return null;

    // Display route content
    return <>{children}</>;
};

export default ProtectedRoute;