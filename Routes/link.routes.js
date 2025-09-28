const express = require('express');
const router = express.Router();
const {nanoid} = require('nanoid');
const Link = require('../models/link.model.js');

// Yeh hamara security guard hai
const isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/login');
}


router.post('/links',isAuth, async (req, res) => {
    try{
        const { originalUrl } = req.body;

        const shortCode = nanoid(7);

        // Step 3: Naya Link object taiyaar karna
        const newLink = new Link({
            originalUrl: originalUrl,
            shortCode: shortCode,
            owner: req.user._id // Logged-in user ki ID ko owner set karna
        });

        // Step 4: Naye link ko database mein save karna
        await newLink.save();

                // Sticky note yahan likh rahe hain
        req.flash('success', 'Naya link safaltapoorvak ban gaya!');


        // Step 5: User ko wapas dashboard par bhej dena
        res.redirect('/user/dashboard');
    }catch (error) {
        console.error("Link banane mein error:", error);
        res.send("Server mein kuch gadbad hai.");
           req.flash('error', 'Link banane mein gadbad ho gayi!');
        res.redirect('/user/dashboard');
    }
})

router.get('/:shortCode', async (req, res) => {
    try {
        console.log("Step 1: Redirect route hit. Code:", req.params.shortCode);
        
        const link = await Link.findOne({ shortCode: req.params.shortCode });
        console.log("Step 2: Database se link dhoondha.", link);

        if (!link) {
            console.log("Step 3: Link nahi mila. 404 bhej raha hoon.");
            return res.status(404).send('URL not found');
        }

        link.clicks++;
        console.log("Step 3: Click count badhaya. Ab save kar raha hoon.");
        
        await link.save();
        console.log("Step 4: Save ho gaya. Ab redirect kar raha hoon to:", link.originalUrl);

        res.redirect(link.originalUrl);

    } catch (error) {
        console.error("Redirect mein error:", error);
        res.status(500).send("Server Error");
    }
});

// link.routes.js

// ROUTE: Ek specific link ko delete karna
// Hum POST use kar rahe hain kyunki HTML form DELETE ko direct support nahi karta
router.post('/links/:id/delete', isAuth, async (req, res) => {
    try {
        const linkId = req.params.id;
        const userId = req.user._id;

        // YEH SABSE ZAROORI SECURITY CHECK HAI
        // Hum link ko ID aur owner ID, dono se dhoondh kar delete karenge.
        // Isse yeh sunishchit hoga ki koi user kisi doosre user ka link delete na kar sake.
        await Link.findOneAndDelete({ _id: linkId, owner: userId });

        // Flash message set karna
        req.flash('success', 'Link safaltapoorvak delete ho gaya!');
        
        // Waapas dashboard par bhej dena
        res.redirect('/user/dashboard');

    } catch (error) {
        console.error("Link delete karne mein error:", error);
        req.flash('error', 'Link delete karne mein gadbad ho gayi.');
        res.redirect('/user/dashboard');
    }
});


module.exports = router;
