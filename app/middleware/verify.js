import { config } from "dotenv";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function Verify(req, res, next) {
    try {
        // get the session cookie from request header
        const authHeader = req.headers["cookie"];

        // If there is no cookie from request header, send an unauthorized response.
        if (!authHeader) {
            return res.sendStatus(401);
        }

        // If there is, split the cookie string to get the actual jwt
        const cookie = authHeader.split("=")[1];

        // Verify using jwt to see if token has been tampered with or if it has expired.
        // that's like checking the integrity of the cookie
        jwt.verify(cookie, config.SECRET_ACCESS_TOKENM, async (err, decoded) => {
            if (err) {
                // If token has been altered or has expired, return an unauthorized error
                return res
                    .status(401)
                    .json({
                        message: "This session has expired, Please login again!",
                    });
            }

            // get user id from the decoded token
            const { id } = decoded;

            // find user by that `id`
            const user = await User.findById(id);

            // return user object without the password
            const { password, ...data } = user._doc;

            // put the data object into req.user
            req.user = data;

            next();
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error!",
        });
    }
}