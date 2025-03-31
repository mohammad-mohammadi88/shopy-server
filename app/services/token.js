const jwt = require("jsonwebtoken");


const createToken = (data , expiresIn = "10d") => {
    return jwt.sign(
        data,
        process.env.TOKEN_KEY || 'a6d1dfe28604b293d6fc87aeb41b21795f24bd6121f2ebba7717d4700300142ce06e19d20e74e1c6ad423dd1cf9fba1dd75ab0f99f5c49a7daa60cd1f1124b1808c02e2c7379',
        {
            expiresIn, // 60s = 60 seconds - (60m = 60 minutes, 2h = 2 hours, 2d = 2 days)
        }  
    );
}



module.exports = { createToken }