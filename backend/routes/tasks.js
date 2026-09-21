const express = require("express");
const router = express.Router();

const Task = require("../models/Task");

// GET all tasks
router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
});

// GET a single task
router.get("/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(task);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        res.status(500).json({
            message: "Failed to fetch task"
        });
    }
});

// CREATE a task
router.post("/", async (req, res) => {
    try {
        const { title } = req.body;

        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const newTask = await Task.create({
            title: title.trim(),
            completed: false
        });

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create task"
        });
    }
});

// UPDATE a task
router.put("/:id", async (req, res) => {
    try {
        const { title, completed } = req.body;
        const updates = {};

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    message: "Task title cannot be empty"
                });
            }

            updates.title = title.trim();
        }

        if (completed !== undefined) {
            if (typeof completed !== "boolean") {
                return res.status(400).json({
                    message: "Completed must be a boolean"
                });
            }

            updates.completed = completed;
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(task);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        res.status(500).json({
            message: "Failed to update task"
        });
    }
});

// DELETE a task
router.delete("/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        res.status(500).json({
            message: "Failed to delete task"
        });
    }
});

module.exports = router;