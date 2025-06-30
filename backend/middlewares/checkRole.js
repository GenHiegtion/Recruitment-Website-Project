import { User } from "../models/user.model.js";

/**
 * Middleware kiểm tra người dùng có vai trò được chỉ định không
 * @param {string[]} roles - Mảng các vai trò được phép truy cập
 * @returns {function} Middleware
 */
const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            // userId đã được lấy từ token trong middleware isAuthenticated
            const userId = req.id;
            
            // Tìm thông tin người dùng trong CSDL để lấy vai trò
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    message: "Không tìm thấy thông tin người dùng",
                    success: false
                });
            }
            
            // Kiểm tra xem vai trò của người dùng có trong mảng các vai trò được phép không
            if (!roles.includes(user.role)) {
                return res.status(403).json({
                    message: "You have no authorization to access this resource",
                    success: false
                });
            }
            
            // Nếu người dùng có quyền, lưu thông tin role vào request để sử dụng sau này nếu cần
            req.userRole = user.role;
            
            // Tiếp tục xử lý request
            next();
        } catch (error) {
            console.log("Role check error:", error);
            return res.status(500).json({
                message: "Lỗi kiểm tra quyền truy cập",
                success: false
            });
        }
    };
};

export default checkRole;