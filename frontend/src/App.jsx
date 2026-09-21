import { useEffect, useState, useMemo } from "react";
import "./App.css";

const API_URL = "/api/tasks";

// Lightweight inline SVGs for crisp modern icons
const Icons = {
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  Alert: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  Clipboard: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
  ),
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  async function fetchTasks() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to load tasks from server.");
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

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      setError("");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), completed: false }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create task.");

      setTasks((prev) => [data, ...prev]);
      setTitle("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleTask(task) {
    const originalTasks = [...tasks];
    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id ? { ...item, completed: !item.completed } : item
      )
    );

    try {
      setError("");
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, completed: !task.completed }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update task.");
      }
    } catch (err) {
      setTasks(originalTasks);
      setError(err.message);
    }
  }

  async function deleteTask(id) {
    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      setError("");
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete task.");
      }
    } catch (err) {
      setTasks(originalTasks);
      setError(err.message);
    }
  }

  function handleStartEdit(task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  async function handleSaveEdit(task) {
    if (!editingTitle.trim() || editingTitle === task.title) {
      setEditingId(null);
      return;
    }

    try {
      setError("");
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, title: editingTitle.trim() }),
      });

      const updatedTask = await response.json();
      if (!response.ok) throw new Error(updatedTask.message || "Failed to edit task.");

      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? updatedTask : item))
      );
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    });
  }, [tasks, filter]);

  const completedCount = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks]
  );

  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="app-container">
      <div className="app-card">
        {/* Header */}
        <header className="header">
          <div className="badge">DevOps Portfolio</div>
          <h1>Task Hub</h1>
          <p>Streamline your workflow, one task at a time.</p>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <Icons.Alert />
              <span>{error}</span>
            </div>
            <button className="error-close" onClick={() => setError("")} aria-label="Dismiss error">
              &times;
            </button>
          </div>
        )}

        {/* Input Form */}
        <form className="task-form" onSubmit={addTask}>
          <div className="input-group">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              className="task-input"
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !title.trim()}
            >
              {submitting ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <Icons.Plus />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Productivity Bar & Progress */}
        <div className="dashboard-bar">
          <div className="stats-container">
            <div className="stats">
              <span className="stat-item">
                <strong>{tasks.length}</strong> Total
              </span>
              <span className="stat-divider">•</span>
              <span className="stat-item">
                <strong>{completedCount}</strong> Done
              </span>
            </div>
            {tasks.length > 0 && (
              <div className="progress-wrapper">
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className="progress-label">{progressPercent}%</span>
              </div>
            )}
          </div>

          <div className="filter-tabs" role="tablist">
            {["all", "active", "completed"].map((type) => (
              <button
                key={type}
                role="tab"
                aria-selected={filter === type}
                className={`tab-btn ${filter === type ? "active" : ""}`}
                onClick={() => setFilter(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main List */}
        <main className="content-area">
          {loading ? (
            <div className="skeleton-container">
              <div className="skeleton-item shimmer"></div>
              <div className="skeleton-item shimmer"></div>
              <div className="skeleton-item shimmer"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Icons.Clipboard />
              </div>
              <h3>No tasks found</h3>
              <p>
                {filter === "all"
                  ? "Your board is empty. Add a task above to get started."
                  : `You have no ${filter} tasks right now.`}
              </p>
            </div>
          ) : (
            <ul className="task-list">
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className={`task-item ${task.completed ? "is-completed" : ""}`}
                >
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                    />
                    <span className="custom-checkmark">
                      <Icons.Check />
                    </span>
                  </label>

                  <div className="task-content">
                    {editingId === task.id ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleSaveEdit(task)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(task);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="task-title"
                        onDoubleClick={() => handleStartEdit(task)}
                        title="Double-click to edit"
                      >
                        {task.title}
                      </span>
                    )}
                  </div>

                  <div className="action-buttons">
                    {editingId !== task.id && (
                      <button
                        className="icon-btn edit-btn"
                        onClick={() => handleStartEdit(task)}
                        title="Edit task"
                        aria-label="Edit task"
                      >
                        <Icons.Edit />
                      </button>
                    )}
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>

        <footer className="footer">
          <p>
            Built for scalability with <strong>React</strong> &bull; <strong>Express</strong>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;