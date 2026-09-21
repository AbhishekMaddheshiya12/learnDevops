const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Task = require("../models/Task");

// Return a consistent task format for React
function formatTask(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    completed: task.completed,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

// Validate MongoDB task IDs
function isValidTaskId(id) {
  return mongoose.isValidObjectId(id);
}

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    res.status(200).json(tasks.map(formatTask));
  } catch (error) {
    console.error("Fetch tasks error:", error.message);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
});

// GET a single task
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidTaskId(id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json(formatTask(task));
  } catch (error) {
    console.error("Fetch single task error:", error.message);

    res.status(500).json({
      message: "Failed to fetch task",
    });
  }
});

// CREATE a task
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      completed: false,
    });

    res.status(201).json(formatTask(task));
  } catch (error) {
    console.error("Create task error:", error.message);

    res.status(500).json({
      message: "Failed to create task",
    });
  }
});

// UPDATE a task: edit title and/or completion status
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (!isValidTaskId(id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty",
        });
      }

      updates.title = title.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return res.status(400).json({
          message: "Completed must be a boolean",
        });
      }

      updates.completed = completed;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide a title or completion status to update",
      });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json(formatTask(task));
  } catch (error) {
    console.error("Update task error:", error.message);

    res.status(500).json({
      message: "Failed to update task",
    });
  }
});

// DELETE a task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidTaskId(id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      id: task._id.toString(),
    });
  } catch (error) {
    console.error("Delete task error:", error.message);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});

module.exports = router;
