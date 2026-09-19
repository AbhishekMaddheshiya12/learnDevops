const express = require("express");
const router = express.Router();

let tasks = [];
let nextId = 1;

// GET all tasks
router.get("/", (req, res) => {
    res.json(tasks);
});

// GET a single task
router.get("/:id", (req, res) => {
    const task = tasks.find(
        (task) => task.id === Number(req.params.id)
    );

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.json(task);
});

// CREATE a task
router.post("/", (req, res) => {
    const { title } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const newTask = {
        id: nextId++,
        title: title.trim(),
        completed: false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
});

// UPDATE a task
router.put("/:id", (req, res) => {
    const task = tasks.find(
        (task) => task.id === Number(req.params.id)
    );

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const { title, completed } = req.body;

    if (title !== undefined) {
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Task title cannot be empty"
            });
        }

        task.title = title.trim();
    }

    if (completed !== undefined) {
        if (typeof completed !== "boolean") {
            return res.status(400).json({
                message: "Completed must be a boolean"
            });
        }

        task.completed = completed;
    }

    res.json(task);
});

// DELETE a task
router.delete("/:id", (req, res) => {
    const taskIndex = tasks.findIndex(
        (task) => task.id === Number(req.params.id)
    );

    if (taskIndex === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    tasks.splice(taskIndex, 1);

    res.json({
        message: "Task deleted successfully"
    });
});

module.exports = router;