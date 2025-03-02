import { Verify } from "../middleware/verify.js";

const Router = (app) => {
    // home route with the get method and a handler
    app.get("/app", (req, res) => {
        try {
            res.status(200).json({
                status: "success",
                data: [],
                message: "Welcome to our API homepage!",
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    });

    // session verify route
    app.get("/app/user", Verify, (req, res) => {
        res.status(200).json({
            status: "success",
            message: "Welcome to your Dashboard!",
        });
    });
};
export default Router;