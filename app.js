require('dotenv').config();
const express = require('express');
const userRoutes = require('./Routes/user.routes');
const app = express();
const connectDB = require('./config/db')
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user.model');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const linkRoutes = require('./Routes/link.routes');
const MongoStore = require('connect-mongo');

// Connect to MongoDB


connectDB();
// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// session waale code ko isse replace karein
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URL 
    })
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/user/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
        console.log("\nSTEP 1: GOOGLE STRATEGY SHURU HUI"); // <-- LOG 5

    try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);
        console.log("  -> SUCCESS: User Google ID se mil gaya. Login kar rahe hain."); // <-- LOG 6


        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
        }

        const newUser = await User.create({
            googleId: profile.id,
            fullName: profile.displayName,
            email: profile.emails[0].value,
        });
        return done(null, newUser);

    } catch (error) {
        console.error("  -> ERROR: Google Strategy mein error aaya:", error); // <-- LOG 7

        return done(error, null);
    }
}));

passport.use(new LocalStrategy({ usernameField: 'email' },
  async (email, password, done) => {
    try {
        // 1. Database mein user ko email se dhoondho
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Agar user nahi mila, toh error message ke saath fail karein
            return done(null, false, { message: 'Is email se koi user registered nahi hai.' });
        }

        // 2. User ke password ko compare karo (check karo ki user ne password set kiya hai ya nahi)
        if (!user.password) {
            // User ne Google se sign up kiya tha aur password set nahi hai
            return done(null, false, { message: 'Aapne Google se sign up kiya tha. Kripya Google se login karein.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Agar password match nahi hua
            return done(null, false, { message: 'Aapka password galat hai.' });
        }

        // 3. Agar sab kuch sahi hai, user object return karein
        return done(null, user);
    } catch (error) {
        return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
    console.log("STEP 2: SERIALIZE USER, User ID session mein save ho raha hai:", user.id); // <-- LOG 8
    done(null, user.id);
});

// app.js

passport.deserializeUser(async (id, done) => {
    console.log("STEP 3: DESERIALIZE USER, ID:", id); // <-- LOG 1
    try {
        const user = await User.findById(id);
        if (!user) {
            console.log("  -> GADBAD: deserializeUser mein user nahi mila!"); // <-- LOG 2
            return done(null, false); 
        }
        console.log("  -> SUCCESS: User mil gaya aur session ke liye taiyaar hai."); // <-- LOG 3
        done(null, user);
    } catch (error) {
        console.error("  -> ERROR: deserializeUser mein error aaya:", error); // <-- LOG 4
        done(error, null);
    }
});


app.get('/', (req, res) => {
    res.send("Hello World - <a href='/user/signup'>Go to Signup</a> or <a href='/user/login'>Go to Login</a>");
     
});

// Routes
app.use('/user', userRoutes);
app.use('/', linkRoutes);

// Start the server




const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
}) 