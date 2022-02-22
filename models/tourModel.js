const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User=require('./userModel');

const tourSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A tour must have a name'],
        minLength:[10,'A tour must have 10 characters at minimum'],
        maxLenghth:[40,'A tour must have 40 characters at maximum'],
        unique:true,
        trim:true,
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,'A tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have difficulty'],
        enum:{
            values:['easy','medium','difficult'],
            message:'Invalid difficulty'
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,'A tour must have at least 1 as the rating'],
        max:[5,'A tour must have at most 5 as the rating'],
        set:value=>Math.round(value*10)/10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'A tour must have a price'],
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                return val<this.price
            }
        }
    },
    summary:{
        type:String,
        required:[true,'A tour must have a summary'],
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation:{
        //GeoJSON
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number], //Array contating longitude and latitude
        address:String,
        description:String
    },
    locations:[
        {    //Embedding all the locations in the tour into an array of documents
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number
        }
    ],
    guides:[
        {
        type:mongoose.Schema.ObjectId,
        ref:'User'
        }
    ]
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

//Indexing 

tourSchema.index({price:1,ratingsAverage:-1}) //Compound Indexing the price and ratingsAverage fields in ascending order
tourSchema.index({slug:1}) //Indexing the slug field for faster access based on name
tourSchema.index({startLocation:'2dsphere'}) //Indexed on a 2dsphere

//Virtual Properties

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
})  

tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour', //The field in the Review model that references the tour
    localField:'_id' //The field where the tour id is stored in the current model 
    })

//Document middleware: runs before .save() and .create()
tourSchema.pre('save',function(next){
    this.slug=slugify(this.name,{lower:true});
    next();
})

// tourSchema.pre('save',async function(next){
//     const guidesPromises=this.guides.map(async id=> await User.findById(id));
//     this.guides=await Promise.all(guidesPromises);
//     next();
// })

//Query middleware

tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}}); //this refers to the current query
    next();
})

tourSchema.pre(/^find/,function(next){ //For populating the guides field which is referencing the user model
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt' //To exclude __v and passwordChangedAt from the response
        });
    next();
})

//Aggregation middleware
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
//     next();
// })


const Tour=mongoose.model('Tour',tourSchema); 

module.exports=Tour;