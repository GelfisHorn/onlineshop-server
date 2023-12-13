import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * Check if the user is authenticated
 * @param req - request object
 * @param res - response object
 * @param next - callback
*/

const checkAuth = async (req, res, next) => {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            
            req.user = await User.findById(decoded.id).select('-password -confirmed -token -createdAt -updatedAt -__v')
            if(!req.user) {
                const error = new Error('Invalid JWT')
                return res.status(401).json({ msg: error.message })
            }

            return next()
        } catch (err) {
            const error = new Error(err);
            return res.status(404).json({ msg: error.message })
        }
    }

    if (!token) {
        const error = new Error('Invalid JWT')
        return res.status(401).json({ msg: error.message })
    }

    next()
}

export default checkAuth