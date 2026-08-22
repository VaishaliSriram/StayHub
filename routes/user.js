const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");
const { saveRedirectUrl } = require("../middleware");

// =======================
// SIGNUP - GET
// =======================
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// =======================
// SIGNUP - POST
// =======================
router.post("/signup", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, function (err) {
            if (err) return next(err);

            req.flash("success", "Welcome to WanderLust!");
            return res.redirect("/listings");
        });

    } catch (err) {
        req.flash("error", err.message); // ✅ better UX
        return res.redirect("/signup");
    }
});

// =======================
// LOGIN - GET (ADD THIS)
// =======================
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// =======================
// LOGIN - POST (UPDATED)
// =======================
router.post("/login",
    saveRedirectUrl, // ✅ IMPORTANT
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (req, res) => {
        let redirectUrl = res.locals.redirectUrl || "/listings";
        delete req.session.redirectUrl;

        req.flash("success", "Welcome back!");
        res.redirect(redirectUrl);
    }
);

// =======================
// LOGOUT
// =======================
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
});

module.exports = router;