import express from "express";
import { PORT, URI } from "./config/index.js";
import Router from "./routes/index.js";



// Create Server
const app = express();

// Connect route handler to app
Router(app);

// step-5 Start up app
app.listen(PORT, () => console.log(`app running on http://localhost:${PORT}`));