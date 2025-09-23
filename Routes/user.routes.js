const express = require('express');
const router = express.Router();



router.get('/signup',(req,res)=>{
    res.render('Sign-up');
})




module.exports = router;// You can add user-related routes here in the future