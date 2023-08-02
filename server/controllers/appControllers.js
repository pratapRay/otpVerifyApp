const UserModel = require('../model/Usermodel');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator')

const secret = "thisismysecretforotpverificattionappandthisissoawesomwithfullauthentication" ;

/** middleware for verify user */
async function verifyUser(req,res,next){
    try {
        
        const { username } = req.method == "GET" ? req.query : req.body;

        // check the username existance
        const exist =  await UserModel.findOne({username});
        if(!exist){
            return res.status(404).send({ error : "Can't find user"});    
        }
        next();
    } catch (error) {
        return res.status(404).send({error: "Authentication Error"});
    }
}

/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
async function register(req,res){
    try {
        const {username, password, profile, email} = req.body;

        const existingUsername = await UserModel.findOne({username});
        if(existingUsername){
            return res.status(409).json({error: "Please use a unique username"})
        }

        const existingEmail = await UserModel.findOne({ email });
        if(existingEmail){
            return res.status(409).json({ error : "Please use a unique email"})
        }

        if(password){
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new UserModel({
                username,
                password : hashedPassword,
                profile : profile || "",
                email
            });

            await user.save();
            return res.status(201).json({msg: "User registered successfully"})
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error : "Internal server error"})
    }
}

/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
async function login(req,res){
try {
    const { username, password } = req.body;

    const isUser = await UserModel.findOne({ username });
 
    if(isUser){
 
     const isPassword = await bcrypt.compare(password, isUser.password);
 
     if(isPassword){
 
         // create jwt token
         const token = jwt.sign({
             userId : isUser._id,
             username : isUser.username,
         },
         secret,
         {expiresIn : "24h"}
         )
         
         return res.status(201).send({
             msg : "Login Successful...!",
             username : isUser.username,
             token,
         })
     }else{
         return res.status(404).json({ error : "Password are not match"})
     }
 
    }
    else{
     return res.status(404).send({ error : "Username not Found"});
    }
} catch (error) {
    return res.status(500).send({ error })
}

}

/** GET: http://localhost:8080/api/user/example123 */
async function getUser(req,res){
   
  

    try {
          const { username } = req.params;
        if(!username) return res.status(501).send({ error : "Invalid Username"});

    //    await UserModel.findOne({username}, function(err, user){
    //         if(err) return res.status(500).send({err});
    //         if(!user) return res.status(501).send({ error : "Couldn't Find User"});

    //           /** remove password from user */
    //         // mongoose return unnecessary data with object so convert it into json
    //         const { password , ...rest } = Object.assign({}, user.toJSON()) ;

    //         return res.status(201).send(rest)
    //     })

    const user = await UserModel.findOne({username});
    if(!user) return res.status(501).send({ error : "Couldn't Find User"});

    /** remove password from user */
    // mongoose return unnecessary data with object so convert it into json
    const { password , ...rest } = Object.assign({}, user.toJSON()) ;

    return res.status(201).send(rest)

    } catch (error) {
        
        return res.status(404).send({ error : "Cannot Find User Data"})
    }
}

/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
async function updateUser(req,res){
    try {
        const { userId } = req.user;
        if(userId){
            const body = req.body;

            const data = await UserModel.updateOne({_id : userId}, body);

            if(data){
                return res.status(201).send({ msg : "Record Updated...!"});
            }else {
                return res.status(400).send({error: "there is no any data"});
            }
        }else{
            return res.status(401).send({ error : "User not found"});
        }
    } catch (error) {
        return res.status(401).send({ error })
    }
}

/** GET: http://localhost:8080/api/generateOTP */
async function generateOTP(req,res){
    try {
        req.app.locals.OTP = await otpGenerator.generate(6,{
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        })
        res.status(201).send({ code : req.app.locals.OTP })
    } catch (error) {
        return res.status(500).json({ error })
    }
}

/** GET: http://localhost:8080/api/verifyOTP */
async function  verifyOTP(req,res){
   try {
    const { code } = req.query;
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null; //reset teh OTP value
        req.app.locals.resetSession = true; // start session for the reset password
        return res.status(201).send({ msg : "verify Successfully"});
    }
    return res.status(404).send({ error : "Invalid OTP"});
   } catch (error) {
    return res.status(440).send({ error});
   }
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
async function  createResetSession(req,res){
    if(req.app.locals.resetSession){
        return res.status(201).send({ flag : req.app.locals.resetSession })
    }

    return res.status(440).send({ error : " Session expired!"})
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession) return res.status(440).send({ error: "Session expired" });
    const { username, password } = req.body;

    try {
      const user = await UserModel.findOne({ username });
      if (user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        if (hashedPassword) {
          await UserModel.updateOne({ username: user.username }, { password: hashedPassword });
          req.app.locals.resetSession = false; // reset session
          return res.status(201).send({ msg: "Record Updated...!" });
        } else {
          return res.status(401).send({ error: "Unable to hash password" });
        }
      } else {
        return res.status(400).send({ error: "Username is not Found" });
      }
    } catch (error) {
      return res.status(404).send({ error });
    }
  } catch (error) {
    return res.status(500).send({ error });
  }
}



module.exports = {
    verifyUser,
    register,
    login,
    getUser,
    updateUser,
    generateOTP,
    verifyOTP,
    createResetSession,
    resetPassword
}

