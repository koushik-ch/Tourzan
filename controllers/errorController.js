module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode||500;
    err.status=err.status||'error';

    if(err.code===11000){
        err.message='Duplicate field value entered';
        err.statusCode=400;
    }
    if(err.name==='ValidationError'){
        const messages=Object.values(err.errors).map(val=>val.message);
        err.message=`Invalid input data. ${messages.join('. ')}`; 
        err.statusCode=400;
    }

    if(err.name==='JsonWebTokenError'){
        err.message='Invalid token, please log in again';
        err.statusCode=401;
    }
    if(err.name==='TokenExpiredError'){
        err.message='Token expired, please log in again';
        err.statusCode=401;
    }
    console.log(err.message)
    if(!req.originalUrl.startsWith('/api')){
        return res.render('error',{
            title:'Something went wrong',
            message:err.message,
            statusCode:err.statusCode
        });
    }
    res.status(err.statusCode).json({
        status:err.statusCode,
        error:err,
        message:err.message
    })
} 