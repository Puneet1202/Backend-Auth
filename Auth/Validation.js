const { body } = require('express-validator');

// Validation rules for signup
exports.signupValidation  =[
    body('username')
]
