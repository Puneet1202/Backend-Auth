const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
        trim : true,   
        minLength:3,
        maxLength:30
    },
    email:{
        type:String,
        required:true,
        trime : true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minLength:6
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },

    passwordResetToken: String,
    passwordResetExpires: Date,
})

userSchema.pre('save',async function(next){
    const user = this;
 
    if (!user.isModified('password')) {
        return next(); // Agar password nahi badla, to kuch mat karo, aage badh jao
    }
    try{
        const hashedPassword =  await bcrypt.hash(user.password,12);
        user.password = hashedPassword;
        return next();
    }catch(err){
        return next(err);
    }
})



const User = mongoose.model('User',userSchema);

module.exports = User;