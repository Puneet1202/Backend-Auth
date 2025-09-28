const mongoose = require('mongoose');

// Hum Mongoose se ek naya blueprint (Schema) bana rahe hain
const linkSchema = new mongoose.Schema({
    
    // originalUrl: Woh lamba URL jise user chota karna chahta hai
    originalUrl: {
        type: String,   // Iska data type text (String) hoga
        required: true  // Yeh field zaroori hai, iske bina data save nahi hoga
    },

    // shortCode: Hamara banaya hua unique chota code
    shortCode: {
        type: String,
        required: true,
        unique: true    // unique: true yeh sunishchit karta hai ki koi bhi do links ka shortCode same na ho
    },

    // clicks: Link par kitni baar click hua
    clicks: {
        type: Number,
        required: true,
        default: 0      // default: 0 ka matlab, jab naya link banega toh clicks ki value apne aap 0 set ho jayegi
    },

    // owner: Is link ko kisne banaya
    owner: {
        type: mongoose.Schema.Types.ObjectId, // Yahan hum User ka special ID store karenge
        ref: 'User',                          // ref: 'User' Mongoose ko batata hai ki yeh ID 'User' model se judi hai
        required: true
    }
}, { 
    // timestamps: true Mongoose ko bolta hai ki 'createdAt' aur 'updatedAt' fields apne aap bana do
    timestamps: true 
});

// Is blueprint (linkSchema) ko ek model (real-world object) mein badal rahe hain
// ab hum code mein 'Link' ka istemal karke database se baat kar sakte hain
const Link = mongoose.model('Link', linkSchema);

module.exports = Link; // Is model ko doosri files mein use karne ke liye export kar rahe hain