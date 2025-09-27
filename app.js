require('dotenv').config();
const express = require('express');
const userRoutes = require('./Routes/user.routes');
const app = express();
const connectDB = require('./config/db')
const session = require('express-session');

connectDB();
// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



            app.use(session({
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,
            }));


app.get('/', (req, res) => {
    res.send("Hello World - <a href='/user/signup'>Go to Signup</a> or <a href='/user/login'>Go to Login</a>");
     
});

// Routes
app.use('/user', userRoutes);




const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
}) 