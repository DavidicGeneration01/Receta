import jwt from 'jsonwebtoken'

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers

        if (!atoken) {
            return res.json({ success: false, message: 'Not Authorized. Login Again.' })
        }

        // ✅ FIX: jwt.verify returns the decoded payload.
        // Since the token was signed with (email + password) as a plain string,
        // the decoded value will be that same string — comparison works correctly.
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)

        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: 'Not Authorized. Login Again.' })
        }

        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ FIX: export was missing entirely in original code
export default authAdmin