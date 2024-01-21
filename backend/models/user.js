const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define user schema
const userSchema = new mongoose.Schema({
  // name: String,
  // registrationNumber: String,
  // email: String,
  // course: String,
  // branch: String,
  // year:String,
  name: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  events: [],
});

userSchema.statics.findAndValidate = async function ({ email, password }) {
  const foundUser = await this.findOne({ email });
  console.log("validate route");
  if (!foundUser) {
    throw new Error("User not found");
  }
  const isValid = await bcrypt.compare(password, foundUser.password);
  if (!isValid) {
    throw new Error("Invalid password");
  }
  return foundUser;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Define user model
const User = mongoose.model("User", userSchema);

module.exports = User;
