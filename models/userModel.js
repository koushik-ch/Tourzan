const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A user must have a name'],
        trim:true,
        maxLength:[40,'A user must have 40 characters at maximum'],
        minLength:[10,'A user must have 10 characters at minimum'],
    },
    email:{
        type:String,
        required:[true,'A user must have an email'],
        unique:true,
        trim:true,
        lowercase:true,
        validate:[validator.isEmail,'Invalid email']
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'A user must have a password'],
        minLength:[8,'A user must have 8 characters at minimum'],
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,'A user must have a password confirmation'],
        validate:{
            validator:function(val){
                return val===this.password;
            }
        }
    },
    passwordChangedAt:{
        type:Date
    },
    passwordResetToken:{
        type:String,
        select:false
    },
    passwordResetExpires:{
        type:Date,
        select:false
    },
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})

    userSchema.pre('save',async function(next){
        //To make sure that the password is hashed only when the password is modified
        if(!this.isModified('password')) return next();

        this.password=await bcrypt.hash(this.password,12);
        this.passwordConfirm=undefined;
        next();
    })

    userSchema.pre('save',function(next){
        //if the password has not been changed, we don't need to update the passwordChangedAt field
        if(!this.isModified('password')||this.isNew) return next();

        //we set the passwordChangedAt field, we subtract 1s as jwt is created before and will cause issues while logging in next time
        this.passwordChangedAt=Date.now()-1000;
        next();

    })
//Middleware for all functions starting with find
userSchema.pre(/^find/,function(next){
     //this is a query middleware
     this.find({active:{$ne:false}});
     console.log('Query middleware');
     next();
})

userSchema.methods.correctPassword=async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changedPasswordAfter=async function(JWTtimeStamp){
    if(this.passwordChangedAt){
        const changedTime=parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTtimeStamp<changedTime;
    }   
    return false;
}

userSchema.methods.createPasswordResetToken=function(){
    const resetToken=crypto.randomBytes(32).toString('hex');
    //We hash the token and we store it in the database so that we can compare it later 
    //when we want to reset the password
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    //We set the expiration date of the token
    this.passwordResetExpires=Date.now()+10*60*1000; //(10 minutes)
    console.log(this.passwordResetToken,resetToken);
    return resetToken;

}


const User=mongoose.model('User',userSchema);

module.exports=User;
