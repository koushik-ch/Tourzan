const Tour=require('../models/tourModel');
const factory=require('./handlerFactory');
const Booking=require('../models/bookingModel');
const AppError=require('../utils/appError');
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession=async (req,res,next)=>{
    try{
        //1. Get the tour
        const tour=await Tour.findById(req.params.tourId);

        //2. Create checkout session
        const session=await stripe.checkout.sessions.create({
            payment_method_types:['card'], 
            success_url:`${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
            cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
            customer_email:req.user.email,
            client_reference_id:req.params.tourId,
            line_items:[{
                name:tour.name,
                description:tour.summary,
                amount:tour.price*100,
                currency:'inr',
                quantity:1
            }]
        })
        //3. Send session as response
        res.status(200).json({
            status:'success',
            session
        });
    }catch(err){
        next(err);
    }
}

exports.createBookingCheckout=async (req,res,next)=>{
    try{
    const {tour,user,price}=req.query;
    if(!tour&&!user&&!price){
        return next();
    }

    await Booking.create({ tour,user, price});
    res.redirect(req.originalUrl.split('?')[0]);
    }catch(err){
        next(err);
    }
}

exports.createBooking=factory.createOne(Booking);
exports.getAllBookings=factory.getAll(Booking);
exports.getBooking=factory.getOne(Booking);
exports.updateBooking=factory.updateOne(Booking);
exports.deleteBooking=factory.deleteOne(Booking);
