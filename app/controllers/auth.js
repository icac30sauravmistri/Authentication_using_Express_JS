import User from "../models/User.js";
import bcrypt from "bcrypt";
import Blacklist from "../models/Blacklist.js";

/**
 * @route POST v1/auth/register
 * @desc Registers a user
 * @access Public
 */

export async function Register(req, res) {
    // get required variables from request body
    // using es6 object destructing
    const { first_name, last_name, email, password } = req.body;

    try {
        // create ana instance of a user
        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
        });

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "It seems you already have an account, please log in instead."
            })
        }

        // save new user into the database
        const savedUser = await newUser.save();

        // Return user's details but password
        const { role, ...user_data } = savedUser._doc;
        user_data.password = undefined;
        res.status(200).json({
            status: "success",
            data: { user_data },
            message: "Thank you for registering with us. Your account has been successfully created."
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error!",
        });
    }
    res.end()
}

export async function Login(req, res) {
    // Get variables for the login process
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Invalid email or password. Please try again with the correct/valid credentials.",
            });
        }
        // if user exists 
        // validate password
        const isPasswordValid = await bcrypt.compare(
            `${req.body.password}`,
            user.password
        );
        // if not valid, return unauthorized response 
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Invalid email or password. Please try again with the correct/valid credentials.",
            });
        }

        let options = {
            // generated token would be expired in 10 min
            maxAge: 10 * 60 * 1000,
            // The cookie is only accessible by the web server
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        // generate session token for user
        const token = user.generateAccessJWT();

        // set the token to response header, so that the client sends it back on each subsequent request
        res.cookie("SessionID", token, options);

        // return user info except password
        const { password, role, ...user_data } = user._doc;

        res.status(200).json({
            status: "success",
            data: [user_data],
            message: "You have successfully logged-in!",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error!",
        });
    }
    res.end();
}

/**
 * @route POST /auth/logout
 * @desc Logout user
 * @access Public
 */
export async function Logout(req, res) {
    try {
        const authHeader = req.headers['cookie']; // get the session cookie from request header
        if (!authHeader) return res.sendStatus(204); // No content
        const cookie = authHeader.split('=')[1]; // If there is, split the cookie string to get the actual jwt token
        const accessToken = cookie.split(';')[0];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
        // if true, send a no content response.
        if (checkIfBlacklisted) return res.sendStatus(204);
        // otherwise blacklist token
        const newBlacklist = new Blacklist({
            token: accessToken,
        });
        await newBlacklist.save();
        // Also clear request cookie on client
        res.setHeader('Clear-Site-Data', '"cookies"');
        res.status(200).json({ message: 'You are logged out!' });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
    res.end();
}