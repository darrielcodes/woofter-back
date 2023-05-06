const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization
        if (bearerToken) {
            const token = bearerToken.split(' ')[1]
            req.token = token;
            let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
            // let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
            // if exp time is less than current time, throw error if true.
            if (decoded.exp < Date.now()/1000) {
                throw {
                    message: "Token Expired"
                }
            }
            req.decoded = decoded
        } else {
            throw {
                message: 'Forbidden'
            }
        }
    } 
    catch (error) {
            console.log('Invalid Token');
    }
    
}

module.exports = {
    verifyToken
}