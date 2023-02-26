// Password: Lokesh1234@.
// Password URL Encoded: Lokesh1234%40%2E
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const connectToMongo = () => {
  mongoose.connect(process.env.DATABASE, () => {
    console.log("Connected to mongoDB");
  });
};

module.exports = connectToMongo;
