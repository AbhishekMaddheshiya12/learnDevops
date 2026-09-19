import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch tasks from backend
    async function fetchTasks() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }

            const data = await response.json();

            setTasks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    // Add a new task
    async function addTask(e) {
        e.preventDefault();

        if (!title.trim()) return;

        try {
            setError("");

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to add task");
            }

            setTasks((previousTasks) => [...previousTasks, data]);
            setTitle("");
        } catch (err) {
            setError(err.message);
        }
    }

    // Toggle task completion
    async function toggleTask(task) {
        try {
            setError("");

            const response = await fetch(`${API_URL}/${task.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    completed: !task.completed
                })
            });

            const updatedTask = await response.json();

            if (!response.ok) {
                throw new Error(
                    updatedTask.message || "Failed to update task"
                );
            }

            setTasks((previousTasks) =>
                previousTasks.map((item) =>
                    item.id === task.id ? updatedTask : item
                )
            );
        } catch (err) {
            setError(err.message);
        }
    }

    // Delete a task
    async function deleteTask(id) {
        try {
            setError("");

            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete task");
            }

            setTasks((previousTasks) =>
                previousTasks.filter((task) => task.id !== id)
            );
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="app">
            <header className="header">
                <h1>Task Manager</h1>
                <p>Manage your work, one task at a time.</p>
            </header>

            <main className="container">
                <form className="task-form" onSubmit={addTask}>
                    <input
                        type="text"
                        placeholder="Enter a new task..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <button type="submit">
                        Add Task
                    </button>
                </form>

                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

                <div className="task-summary">
                    <span>Total: {tasks.length}</span>

                    <span>
                        Completed: {
                            tasks.filter((task) => task.completed).length
                        }
                    </span>
                </div>

                {loading ? (
                    <p className="message">Loading tasks...</p>
                ) : tasks.length === 0 ? (
                    <p className="message">
                        No tasks yet. Add your first task!
                    </p>
                ) : (
                    <ul className="task-list">
                        {tasks.map((task) => (
                            <li className="task-item" key={task.id}>
                                <label className="task-label">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleTask(task)}
                                    />

                                    <span
                                        className={
                                            task.completed
                                                ? "completed"
                                                : ""
                                        }
                                    >
                                        {task.title}
                                    </span>
                                </label>

                                <button
                                    className="delete-button"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <footer>
                <p>React + Express | DevOps Training Project</p>
            </footer>
        </div>
    );
}

export default App;