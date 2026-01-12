const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT tokens
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error){
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
};

//Middleware to verify roles
const checkRole = (...allowedRoles) =>{
    return (req,res, next) => {
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message: 'Acess forbidden. You do not have the required role.'
            });
        }
        next();
    };
};

module.exports = {verifyToken, checkRole};