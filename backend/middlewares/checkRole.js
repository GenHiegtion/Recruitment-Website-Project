import { User } from "../models/user.model.js";

/**
 * Middleware to check if user has the specified role
 * @param {string[]} roles - Array of roles allowed to access
 * @returns {function} Middleware
 */
const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            // userId was obtained from token in isAuthenticated middleware
            const userId = req.id;
            
            // Find user information in the database to get the role
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    message: "User information not found",
                    success: false
                });
            }
            
            // Check if user's role is in the array of permitted roles
            if (!roles.includes(user.role)) {
                return res.status(403).json({
                    message: "You have no authorization to access this resource",
                    success: false
                });
            }
            
            // If user has permission, save role information in request for later use if needed
            req.userRole = user.role;
            
            // Continue processing request
            next();
        } catch (error) {
            console.log("Role check error:", error);
            return res.status(500).json({
                message: "Error checking access permission",
                success: false
            });
        }
    };
};

export default checkRole;