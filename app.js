require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");


const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRoutes = require("./routes/user.js");
const bookingRoutes = require("./routes/booking");



// Models
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

// Utils
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

// Validation Schema
const { reviewSchema } = require("./schema.js");

// Routes
const listingRoutes = require("./routes/listing.js");


/* =======================
   MongoDB Connection
======================= */

/* =======================
   MongoDB Connection
======================= */

mongoose.set("strictQuery", true);

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("✅ Connected to MongoDB Atlas");
    } catch (err) {
        console.log("❌ MongoDB Error:", err);
    }
}

main();

/* =======================
   View Engine
======================= */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);


/* =======================
   Middleware
======================= */

// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));
// app.use(express.static(path.join(__dirname, "public")));
// app.use(cookieParser("secretcode"));
// app.use(session({
//     secret: "mysupersecret",
//     resave: false,
//     saveUninitialized: true,
// }));


// app.use(flash());
// // app.use((req, res, next) => {
// //     res.locals.success = req.flash("success");
// //     res.locals.error = req.flash("error");
// //     next();
// // });

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


// app.use((req, res, next) => {
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     res.locals.currUser = req.user; // 👈 add this line
//     next();
// });
/* =======================
   Middleware
======================= */

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser("secretcode"));

const sessionOptions = {
    secret: process.env.SECRET || "mysupersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));

app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash + current user
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
app.use("/bookings", bookingRoutes);



/* =======================
   Root Route
======================= */

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Normal cookie
app.get("/setcookie", (req, res) => {
    res.cookie("username", "vaishali");
    res.send("Cookie set");
});

app.get("/getcookie", (req, res) => {
    res.send(req.cookies);
});

// Signed cookie
app.get("/setsigned", (req, res) => {
    res.cookie("token", "secure123", { signed: true });
    res.send("Signed cookie set");
});

app.get("/getsigned", (req, res) => {
    res.send(req.signedCookies);
});
/* =======================
   Session Routes
======================= */

// Test session counter
app.get("/testsession", (req, res) => {
    if (req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send(`You visited ${req.session.count} times`);
});

// Store session
app.get("/setsession", (req, res) => {
    req.session.name = "vaishali";
    res.send("Session set");
});

// Get session
app.get("/getsession", (req, res) => {
    res.send(req.session.name || "No session found");
});

/* =======================
   Listing Routes (Router)
======================= */

app.use("/listings", listingRoutes);
app.use("/",userRoutes);


/* =======================
   Review Validation
======================= */

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


/* =======================
   Review Routes
======================= */

app.post(
    "/listings/:id/reviews",
    validateReview,
    wrapAsync(async (req, res, next) => {  // 👈 add next
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        req.flash("success", "Review Added!");
        res.redirect(`/listings/${listing._id}`);
    })
);

// ✅ Fixed DELETE Review
app.delete(
    "/listings/:id/reviews/:reviewId",
    wrapAsync(async (req, res, next) => {  // 👈 add next
        let { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review Deleted!");
        res.redirect(`/listings/${id}`);
    })
);


/* =======================
   404 Handler
======================= */

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


/* =======================
   Error Middleware
======================= */

app.use((err, req, res, next) => {
    console.log("ERROR 👉", err);
    let { statusCode = 500, message = "Something Went Wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});


/* =======================
   Server
======================= */

app.listen(8080, () => {
    console.log("Server Running on Port 8080");
});