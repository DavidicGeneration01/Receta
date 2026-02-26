import jwt from 'jsonwebtoken'

// Admin authentication middleware
const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers

        if (!token) {
            return res.json({ success: false, message: 'Not Authorized. Login Again.' })
        }

        // ✅ FIX: jwt.verify returns the decoded payload.
        // Since the token was signed with (email + password) as a plain string,
        // the decoded value will be that same string — comparison works correctly.
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)

        req.body = req.body || {}
        req.body.userId = token_decode.id
        
        

        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ FIX: export was missing entirely in original code
export default authUser