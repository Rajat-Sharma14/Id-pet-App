const jwt = require("jsonwebtoken")
const verify = {
    async verifyToken(req, res, next) {
        let token = req.headers["authorization"]
        if (!token) {
            return res.status(402).json({
                message: "Token is missing"
            })
        }
        jwt.verify(token, "secret", (err, decoded) => {
            if (err) {
                return res.send("your token is invalid")
            }
            req.user = decoded;
        })
        next()
    }
}
module.exports = verify.verifyToken