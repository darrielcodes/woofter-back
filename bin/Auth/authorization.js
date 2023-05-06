const jwt = require('jsonwebtoken');

const verify = async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization
        if (bearerToken) {
            const token = bearerToken.split(' '[1]);
            req.token = token;
            let decoded = jwt.verify(token, process.env.SECRET_KEY)

        }
    } catch (error) {
        
    }
}