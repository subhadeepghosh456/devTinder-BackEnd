const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
   process.env.DB_CONNETION_SECRECT,
  );
};

module.exports = connectDB;
