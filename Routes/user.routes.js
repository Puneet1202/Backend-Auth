const express = require('express');
const router = express.Router();
const { signupValidation } = require('../Auth/Validation');

const { loginvalidation  } = require('../Auth/Validation');
 const { validationResult } = require('express-validator');
 const UserModel = require('../models/user.model');
// Handle signup form submission



router.get('/signup',  (req,res)=>{
    res.render('Sign-up');
})

router.get('/login',(req,res)=>{
    res.render('Login');
})

// Correct path should be '/signup' (since this router is mounted at '/user')
router.post('/signup', signupValidation, async (req, res) => {
 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json( { errors: errors.array() });
    
    }

    const { fullName, email, password } = req.body;
    await UserModel.create({
        fullName: fullName,
        email : email,
        password : password
    })
    res.send('User registered successfully!');
    console.log(req.body);
    
});

router.post('/login',loginvalidation ,async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json( { errors: errors.array() });
    }

    const {email,password} = req.body;
    const user = await UserModel.findOne({email:email,password:password});
    if(!user){
        return res.status(400).json({message:"Invalid Credentials"});
    }
    res.send('Login Successful');
    console.log(req.body);
     
})




module.exports = router;// You can add user-related routes here in the future