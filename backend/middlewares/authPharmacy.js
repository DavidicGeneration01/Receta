import jwt from 'jsonwebtoken'

// Pharmacy authentication middleware
const authPharmacy = async (req, res, next) => {
    try {
        const { token } = req.headers

        if (!token) {
            return res.json({ success: false, message: 'Not Authorized. Login Again.' })
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)

        req.body = req.body || {}
        req.body.pharmacyId = token_decode.id

        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authPharmacy
