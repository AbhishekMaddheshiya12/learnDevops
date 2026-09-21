const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const taskRoutes = require("./routes/tasks");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Home endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Task Manager API is running!"
    });
});

// Health endpoint
app.get("/api/health", (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;

    res.status(databaseConnected ? 200 : 503).json({
        status: databaseConnected ? "healthy" : "unhealthy",
        service: "backend",
        database: databaseConnected ? "connected" : "disconnected"
    });
});

// Task routes
app.use("/api/tasks", taskRoutes);

// Start server after connecting to MongoDB
async function startServer() {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI environment variable is missing");
        }

        await mongoose.connect(MONGO_URI);

        console.log("Connected to MongoDB");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();