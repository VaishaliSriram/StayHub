require("dotenv").config();
const mongoose = require("mongoose");

const initData = require("./data.js");
const Listing = require("../models/listing.js");

// Atlas URL from .env
const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB Atlas");
}

main()
    .then(() => {
        initDB();
    })
    .catch((err) => {
        console.log(err);
    });

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("✅ Data was initialized");
    mongoose.connection.close();
};