import { config } from "dotenv";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function Verify(req, res, next) {
    // get the session cookie from request header
    const authHeader = req.headers["cookie"];

    // if there is no cookie from request header, send an unauthorized response.
    if (!authHeader) return res.sendStatus(401);

    // If there is, split the cookie string to get the actual jwt token
    const cookie = authHeader.split("=")[1];
    const accessToken = cookie.split(";")[0];

    // Check if that token is blacklisted
    const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
    // if true, send an unathorized message, asking for a re-authentication.
    if (checkIfBlacklisted)
        return res
            .status(401)
            .json({ message: "This session has expired. Please login" });

    // if token has not been blacklisted, verify with jwt to see if it has been tampered with or not.
    // that's like checking the integrity of the accessToken
    jwt.verify(accessToken, SECRET_ACCESS_TOKEN, async (err, decoded) => {
        if (err) {
            // if token has been altered, return a forbidden error
            return res
                .status(401)
                .json({ message: "This session has expired. Please login" });
        }

        // get user id from the decoded token
        const { id } = decoded;

        // find user by that `id`
        const user = await User.findById(id);

        // return user object but the password
        const { password, ...data } = user._doc;

        // put the data object into req.user
        req.user = data;

        next();
    });
}


export function VerifyRole(req, res, next) {
    try {
        // we have access to the user object from the request
        const user = req.user;

        // extract the user role
        const { role } = user;

        // check if user has no advance privileges
        // return an unathorized response
        if (role !== "0x88") {
            return res.status(401).json({
                status: "failed",
                message: "You are not authorized to view this page.",
            });
        }
        // continue to the next middleware or function
        next();
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}