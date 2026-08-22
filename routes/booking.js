const express = require("express");
const router = express.Router();

const Booking = require("../models/booking");
const Listing = require("../models/listing");

const { isLoggedIn } = require("../middleware");

router.post("/:id", isLoggedIn, async (req, res) => {
    //     console.log("BOOKING ROUTE HIT");
    // console.log(req.params.id);
        console.log("BOOKING ROUTE HIT");


    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        const { checkIn, checkOut, guests } = req.body;

        const booking = new Booking({
            listing: listing._id,
            user: req.user._id,
            checkIn,
            checkOut,
            guests,
            totalPrice: listing.price,
        });

        await booking.save();
        console.log("BOOKING SAVED");


        req.flash("success", "Booking Successful 🎉");

        res.redirect(`/listings/${listing._id}`);

    } catch (err) {
        console.log(err);
        req.flash("error", "Booking failed!");
        res.redirect("/listings");
    }
});

module.exports = router;