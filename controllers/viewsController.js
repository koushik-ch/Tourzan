const Tour=require('../models/tourModel');
const AppError=require('../utils/appError');
const User=require('../models/userModel');
const Booking=require('../models/bookingModel');

exports.getOverview=async (req,res)=>{
    try{
    
        const tours=await Tour.find();
    
        res.status(200).render('overview',{
            title:'All tours',
            tours
        });
    }catch(err){
        console.log(err);
    }
}

exports.getTour=async (req,res,next)=>{
    try{
        const {slug}=req.params;
        const tour=await Tour.findOne({slug}).populate({
            path:'reviews',
            fields:'review rating user'
        });

        if(!tour){
            return next(new AppError('There is no tour with that name',404));
        }

        res.status(200) 
        .render('tour',{
            title:tour.name,
            tour
        });
    }catch(err){
        console.log(err);
    }
}

exports.getLoginForm =(req,res)=>{
    res.status(200).render('login',{
        title:'Login'
    });
}

exports.getSignupForm =(req,res)=>{
    res.status(200).render('signup',{
        title:'Signup'
    });
}

exports.getAccount=(req,res)=>{
    res.status(200).render('account',{
        title:"Your Account"
    })
};

exports.getMyTours=async (req,res,next)=>{
    try{
        //Find all bookings
        const bookings=await Booking.find({user:req.user.id});

        const tourIds=bookings.map(el=>el.tour)
        
        const tours=await Tour.find({_id:{$in:tourIds}});
        
        res.status(200).render('overview',{
            title:'My Tours',
            tours
        })
    }catch(err){
        next(err)
    }
}