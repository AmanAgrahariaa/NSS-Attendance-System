const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  adminType: {
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
});

adminSchema.statics.findAndValidate = async function ({ email, password }) {
  const foundUser = await this.findOne({ email });
  console.log(`validate route ${foundUser}`);
  if (!foundUser) {
    throw new Error("User not found");
  }
  console.log(`Valid ${email}`);
  const isValid = await bcrypt.compare(password, foundUser.password);
  if (!isValid) {
    throw new Error("Invalid password");
  }
  return foundUser;
};

adminSchema.pre("save", async function (next) {
  console.log("pre.save");
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
