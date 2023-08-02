const jwt = require('jsonwebtoken');
const secret = "thisismysecretforotpverificattionappandthisissoawesomwithfullauthentication"

async function Auth(req,res,next){
    try {
        // access autherize header to validate request
        const token = req.headers.authorization.split(" ")[1];

        // retrive the user details of the logged in user
        const decodeToken = await jwt.verify(token,secret);

        req.user = decodeToken;
        next();
    } catch (error) {
        res.status(401).json({ error:"Authentication Failed" });
      
    }
}

async function localVariables(req,res,next){
    req.app.locals = {
        OTP : null,
        resetSession : false
    }
    next()
}

module.exports = {
    Auth,
    localVariables
};



