const mongoose = require('mongoose');

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
    }
})

const User = mongoose.model('User',userSchema);

module.exports = User;