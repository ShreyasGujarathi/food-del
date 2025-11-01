import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({success:false,message:'Not Authorized Login Again'});
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        req.user = {
            id: token_decode.id,
            role: token_decode.role
        };
        next();
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}

// Role-based access control middleware
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ success: false, message: 'Access denied. Please login again.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied. You do not have permission to access this resource.' });
        }
        next();
    };
};

export default authMiddleware;