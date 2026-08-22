const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Review = require("./review.js");

const ListingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
    },

    image: {
        url: {
            type: String,
            default:
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        },

        filename: {
            type: String,
            default: "listingimage",
        },
    },

    price: {
        type: Number,
    },

    // 🔥 NEW CATEGORY FIELD
    category: {
        type: String,
        required: true,
    },

    location: {
        type: String,
    },

    country: {
        type: String,
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

// Delete all reviews when listing deleted
ListingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({
            _id: { $in: listing.reviews },
        });
    }
});

const Listing = mongoose.model("Listing", ListingSchema);

module.exports = Listing;
3