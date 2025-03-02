import express from "express";
import { Register } from "../controllers/auth.js";
import validate from "../middleware/valdiate.js";
import { check } from "express-validator";

const router = express.Router();

// Register route -- POST request
router.post(
    "/register",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address!")
        .normalizeEmail(),
    check("first_name")
        .not()
        .isEmpty()
        .withMessage("Your first name is required!")
        .trim()
        .escape(),
    check("last_name")
        .not()
        .isEmpty()
        .withMessage("Your last name is required!")
        .trim()
        .escape(),
    check("password")
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage("Must be at least 8 chars long"),
    validate,
    Register
);

export default router;