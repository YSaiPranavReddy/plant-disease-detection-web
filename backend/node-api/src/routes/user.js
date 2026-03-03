import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        totalPredictions: user.totalPredictions,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/user/credits
// @desc    Get user credits
// @access  Private
router.get("/credits", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "credits totalPredictions"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      credits: user.credits,
      totalPredictions: user.totalPredictions,
      remainingPredictions: Math.floor(user.credits / 0.04),
    });
  } catch (error) {
    console.error("Credits fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   POST /api/user/credits/deduct
// @desc    Deduct credits after prediction
// @access  Private
router.post("/credits/deduct", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.hasEnoughCredits()) {
      return res.status(403).json({
        error: "Insufficient credits",
        credits: user.credits,
        required: 0.04,
      });
    }

    await user.deductCredits();

    res.json({
      message: "Credits deducted successfully",
      credits: user.credits,
      remainingPredictions: Math.floor(user.credits / 0.04),
    });
  } catch (error) {
    console.error("Credits deduct error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
