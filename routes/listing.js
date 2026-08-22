const express = require("express");
const router = express.Router();
const multer = require("multer");

const { storage } = require("../cloudConfig");
const upload = multer({ storage });

const Listing = require("../models/listing.js");

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner } = require("../middleware");
const listingController = require("../controllers/listing.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

// ================= VALIDATION =================
const validateListing = (req, res, next) => {

    console.log("BODY 👉", req.body); 

    // Convert price to number
    if (req.body.listing && req.body.listing.price) {
        req.body.listing.price = Number(req.body.listing.price);
    }

    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details
            .map((el) => el.message)
            .join(",");

        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// ================= INDEX =================
router.get("/", wrapAsync(listingController.index));

// ================= NEW =================
router.get(
    "/new",
    isLoggedIn,
    listingController.renderNewForm
);

// ================= SEARCH =================
router.get("/search", wrapAsync(async (req, res) => {

    const { search } = req.query;

    const allListings = await Listing.find({
        $or: [
            {
                title: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                location: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                country: {
                    $regex: search,
                    $options: "i"
                }
            }
        ]
    });

    res.render("listings/index", { allListings });
}));
//CATEGORY
router.get("/category/:category", wrapAsync(async (req, res) => {
    const { category } = req.params;

    const allListings = await Listing.find({
        category: category
    });

    res.render("listings/index", { allListings });
}));

// ================= SHOW =================
router.get(
    "/:id",
    wrapAsync(listingController.showListing)
);

// ================= CREATE =================
router.post(
    "/",
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
);

// ================= EDIT =================
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

// ================= UPDATE =================
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
);

// ================= DELETE =================
router.delete(
    "/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing)
);

module.exports = router;