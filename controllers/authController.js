const {promisify}=require('util');
const jwt=require('jsonwebtoken');
const User=require('../models/userModel');
const AppError=require('../utils/appError');
const Email=require('../utils/email');
const crypto=require('crypto');

const signToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    });
}

const createSendToken=(user,statusCode,req,res)=>{ 

    const token=signToken(user._id);    
    user.password=undefined;

    res.cookie('jwt',token,{
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000), //Converting to milliseconds
        httpOnly:true, //Can be accessed only by the browser
        secure:req.secure||req.headers['x-forwarded-proto']==='https'
    });

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}

exports.signup=async (req,res,next)=>{
    try{
    
    const user=await User.create(req.body);
    
    const url=`${req.protocol}://${req.get('host')}/me`;

    await new Email(user,url).sendWelcome();
    createSendToken(user,201,req,res);  
    }catch(err){
        console.log(err);
        next(err);
    }
}

exports.login=async (req,res,next)=>{
    try{
        const {email,password}=req.body;
        //1. Check if email and password exist
        if(!email || !password){
            return next(new AppError('Please provide email and password',400));
        }
        //2. Check if user exist and password is correct
        const user=await User.findOne({email}).select('+password');
        if(!user || !(await user.correctPassword(password,user.password))){
            return next(new AppError('Incorrect email or password',401));
        }
        
        //3. If everything is ok, send token to client
        createSendToken(user,200,req,res);
    }catch(err){
        next(err);
    }
}

exports.logout=(req,res)=>{
    res.cookie('jwt','loggedout',{
        expires:new Date(Date.now()+10*1000), //Dummy token which expires in 10 seconds
        httpOnly:true
    });
    res.status(200).json({
        status:'success'
    })
}

exports.protect=async (req,res,next)=>{
    try{
    //1. Getting token and check if it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token=req.headers.authorization.split(' ')[1];
    }
    else if(req.cookies.jwt)
        token=req.cookies.jwt;
    if(!token){
        return next(new AppError('You are not logged in!',401))
    }

    //2) Verification Token
    const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET)

    //3) Check if user still exists
    const currentUser=await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('User not found',401))
    }

    //4) Check if user changed password after the token was issued
    if(!currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please log in again',401))
    }

    //GRANT ACCESS TO PROTECTED ROUTE
    req.user=currentUser;
    res.locals.user=currentUser;

    next();
}catch(err){
    next(err);
}
}

//Only for rendered Pages
exports.isLoggedIn=async (req,res,next)=>{
    try{
        
    if(req.cookies.jwt){
        const decoded=await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET)
        const currentUser=await User.findById(decoded.id);
        if(!currentUser){
            return next();
        }
        
        if(!currentUser.changedPasswordAfter(decoded.iat)){
            return next();
        }
    
        res.locals.user=currentUser
        
        return next();
        }
        return next();
    }catch(err){
        return next();
    }
    
}

exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{
        //This middleware is executed only after the user is logged in which means req.user is defined
        
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission for this action',403));
        }
        next();
    }
}

exports.forgotPassword=async (req,res,next)=>{
    try{
        if(!req.body.email){
            return next(new AppError('Please provide an email',400));
        }
        //1. Get user based on email
        const user=await User.findOne({email:req.body.email});
        if(!user){
            return next(new AppError('There is no user with that email address',404));
        }

        //2.Generate the random token
        const resetToken=user.createPasswordResetToken();
        await user.save({validateBeforeSave:false});

        //3. Set the reset token to the email
        const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

        try{

        await new Email(user,resetURL).sendPasswordReset();

        res.status(200).json({
            status:'success',
            message:'Token sent to email'
        })
        }catch(err){
            user.passwordResetToken=undefined;
            user.passwordResetExpires=undefined;
            await user.save({validateBeforeSave:false});
            return next(new AppError('There was an error sending the email'),500);
        }
    }
    catch(err){
        next(err);
    }
}

exports.resetPassword=async (req,res,next)=>{
    try{
    //1. Get user based on the token
    const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user= await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}})
    //2. If token has not expired, and there is user, set the new password
    if(!user){
        return next(new AppError('Token is invalid or has expired',400));
    }
    //3. Set the new password
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;

    await user.save();
    //4. Update changedPasswordAt property for the user
    
    createSendToken(user,200,req,res);

    }catch(err){
        next(err);
    }
}


