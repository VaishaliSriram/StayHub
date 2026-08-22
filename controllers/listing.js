const Listing = require("../models/listing");

// =======================
// INDEX
// =======================
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

// =======================
// NEW
// =======================
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

// =======================
// SHOW
// =======================
module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate("reviews")
        .populate("owner"); // 🔥 important

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
};

// =======================
// CREATE
// =======================
module.exports.createListing = async (req, res) => {

    const newListing = new Listing(req.body.listing);

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    newListing.owner = req.user._id;

    await newListing.save();

    req.flash("success", "New Listing Created!");

    res.redirect("/listings");
};

// =======================
// EDIT
// =======================
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("listings/edit", { listing });
};

// =======================
// UPDATE
// =======================
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    // 🔥 FIX → convert price to number
    req.body.listing.price = Number(req.body.listing.price);

    // 🔥 image format fix
    req.body.listing.image = {
        url: req.body.listing.image,
        filename: "listingimage"
    };

    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// =======================
// DELETE
// =======================
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};