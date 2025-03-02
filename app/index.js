import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { PORT, URI } from "./config/index.js";
import Router from "./routes/index.js";
import Auth from "./routes/auth.js";



// Create Server
const app = express();

// step-1: Configure Header Information
// Allow request from any source. In real production, this should be limited to allowed origins only
app.use(cors());
app.disable("x-powered-by"); //Reduce fingerprinting
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/app/auth', Auth);

// step 2: Connect Database
// Set up mongoose's promise to global promise
mongoose.promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose
    .connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log("Connected to database"))
    .catch((err) => console.log(err));

// step4: Configure Routes ===
// Connect route handler to app
Router(app);
// Auth(app);

// step-5 Start up app
app.listen(PORT, () => console.log(`app running on http://localhost:${PORT}`));