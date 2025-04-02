const checkLandlordRole = (req, res, next) => {
    if (req.user.role !== 'landlord') {
        return res.status(403).json({ message: 'Access denied. Only landlords can perform this action.' });
    }
    next();
};
