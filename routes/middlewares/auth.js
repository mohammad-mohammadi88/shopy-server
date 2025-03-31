const jwt = require('jsonwebtoken');
const db = require('../../app/db/createDatabase');

const auth = (req, res, next) => {
    const token = req.headers?.authorization || req.cookies?.shopy_user_token;

    console.log(token);
    if(! token ) {
        return res.status(401).json({ status: 'fail' , message : 'unauthorized'})
    }

    try {
        let decoded = jwt.verify(token, process.env.TOKEN_KEY);
        console.log(decoded);
        db.get(`SELECT * FROM users WHERE id = ? and token = ?` , [ decoded.user_id , token] , function(err, user) {
            
            if (err) {
                res.status(400).json({"error": err.message})
                return;
            }

            if(user?.token != token) {
                return res.status(401).json({ status: 'fail' , message : 'unauthenticated'})
            }

            const { id , name , phone , isAdmin } = user;
            req.user = { id , name , phone , isAdmin }
            next()
        });
    } catch(err) {
        console.log(err);
        return res.status(401).json({ status: 'fail' , message : 'unauthenticated'})
    }
}


module.exports = auth;