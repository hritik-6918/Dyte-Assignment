// userModel.js
import mongoose from "mongoose";

// Define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["DEVELOPER", "SR_DEVELOPER", "ADMIN"],
    default: "DEVELOPER",
  },
  password: {
    type: String,
    required: true,
  },
});

// Create the User model
const User = mongoose.model("Users", userSchema);

export { User };
