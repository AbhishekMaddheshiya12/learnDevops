const express = require("express");
const cors = require("cors");
require("dotenv").config();

const taskRoutes = require("./routes/tasks");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Home endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Task Manager API is running!"
    });
});

// Health endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "backend"
    });
});

// Task routes
app.use("/api/tasks", taskRoutes);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});