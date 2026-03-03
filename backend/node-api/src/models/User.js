import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
  },
  credits: {
    type: Number,
    default: 4.0,
    min: 0,
  },
  totalPredictions: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has enough credits
userSchema.methods.hasEnoughCredits = function (requiredCredits = 0.04) {
  return this.credits >= requiredCredits;
};

// Method to deduct credits
userSchema.methods.deductCredits = async function (amount = 0.04) {
  if (this.credits >= amount) {
    this.credits -= amount;
    this.totalPredictions += 1;
    return await this.save();
  }
  throw new Error("Insufficient credits");
};

export default mongoose.model("User", userSchema);
