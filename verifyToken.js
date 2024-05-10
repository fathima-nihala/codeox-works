const jwt = require("jsonwebtoken");

const verifyTokenn = (req,res,next) =>{
 console.log('reqqqqqq',req);
 console.log('req.headers.token',req.headers);
 console.log("***",req.headers.token);
    var authheader = req.headers.token;
    console.log("autheader",authheader);
    if(authheader){
        const token =authheader.split(" ")[1];
        console.log("separate token",token);

        jwt.verify (token,process.env.jwt_sec,(err,user)=>{
            if(err){
                console.log("errorr",err);
                return res.status(403).json("Token is not valid");
            }
            req.user=user;
            console.log("user*",user);
            next();
        });
    }else{
        return res.status(401).json({ error: "Token not found" })
    }
}

const verifyTokenAndAuthorization =(req,res,next)=>{
    verifyTokenn(req,res,(data)=>{
        console.log(data); 
        console.log('req.user.id',req.user.id);
        console.log("req.param.id",req.params.id);
        if(req.user.id === req.params.id){
            next()
        }else{
            return res.status(403).json('you are not allowed')
        }
    })
}


module.exports = {verifyTokenn,verifyTokenAndAuthorization}