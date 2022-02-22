const path=require('path');
const express=require('express');
const morgan=require('morgan');
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean')
const hpp=require('hpp');
const cookieParser=require('cookie-parser')

const AppError=require('./utils/appError');
const globalErrorHandler=require('./controllers/errorController');
const tourRouter=require('./routes/tourRoutes');
const userRouter=require('./routes/userRoutes');
const reviewRouter=require('./routes/reviewRoutes');
const viewRouter=require('./routes/viewRoutes')
const bookingRouter=require('./routes/bookingRoutes')

const app=express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views')); 


//Security http headers
app.use(helmet.frameguard());

if(process.env.NODE_ENV=='development'){
    app.use(morgan('dev'));
}

const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'Too many requests from this IP'
});
app.use('/api',limiter); //All the api requests will be limited to 100 requests per hour


//body parser 
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'}));
app.use(cookieParser())

//Data sanitization against NoSQL query injection
app.use(mongoSanitize()); //will filter out mongo query injection

//Data sanitization against XSS attacks
app.use(xss()); // will filter out XSS attacks (mallicious html or js code) 

//Prevent parameter pollution
app.use(hpp({
    whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price'] 
    //These parameters will not be removed and can occur multiple times 
}));

//Static folder
app.use(express.static(path.join(__dirname,'public'))); 

//UI routes
app.use('/',viewRouter);

//Test 
app.use((req,res,next)=>{
    console.log(req.cookies)
    next();
});

//API routes
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter);

app.all('*',(req,res,next)=>{
    
    next(new AppError(`Cant find ${req.originalUrl} on this server`,404));

})

app.use(globalErrorHandler); 



module.exports=app;