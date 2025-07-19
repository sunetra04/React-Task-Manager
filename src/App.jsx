import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {

  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [search, setSearch] = useState("");

  
  const dragId = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tasks"));
    if (stored) setTasks(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const generateId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString();
  };

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks([
      ...tasks,
      {
        id: generateId(),
        text: taskInput.trim(),
        completed: false,
        priority,
      },
    ]);
    setTaskInput("");
    setPriority("medium");
  };

  const toggleComplete = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleDragStart = (id) => () => {
    dragId.current = id;
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = (targetId) => () => {
    const fromIndex = tasks.findIndex((t) => t.id === dragId.current);
    const toIndex = tasks.findIndex((t) => t.id === targetId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    const reordered = [...tasks];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    dragId.current = null;
    setTasks(reordered);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const uncompletedCount = tasks.length - completedCount;
  const progress = tasks.length ? (completedCount / tasks.length) * 100 : 0;

  const filteredTasks = tasks.filter((t) =>
    t.text.toLowerCase().includes(search.toLowerCase())
  );

  const order = { high: 0, medium: 1, low: 2 };
  const sortedTasks = [...filteredTasks].sort(
    (a, b) => order[a.priority] - order[b.priority]
  );

  return (
    <div className="galaxy">
      <div className="app">
        <h2>🪐 To‑Do List</h2>

        
        <input
          className="search-input"
          type="text"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter a task…"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />

          <select
            className="priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button onClick={addTask}>Add</button>
        </div>

        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

       
        {sortedTasks.length === 0 ? (
          <p className="no-tasks">No tasks match your search.</p>
        ) : (
          <ul className="task-list">
            {sortedTasks.map((task) => (
              <li
                key={task.id}
                className={`fade ${task.completed ? "done" : ""}`}
                draggable
                onDragStart={handleDragStart(task.id)}
                onDragOver={handleDragOver}
                onDrop={handleDrop(task.id)}
              >
                {editingId === task.id ? (
                  <input
                    className="edit-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => {
                      const text = editValue.trim();
                      if (text) {
                        setTasks(
                          tasks.map((t) =>
                            t.id === task.id ? { ...t, text } : t
                          )
                        );
                      }
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                    autoFocus
                  />
                ) : (
                  <div
                    className="task-content"
                    onDoubleClick={() => {
                      setEditingId(task.id);
                      setEditValue(task.text);
                    }}
                  >
                    <span className={`priority ${task.priority}`}>
                      {task.priority.toUpperCase()}
                    </span>{" "}
                    {task.text}
                  </div>
                )}

                <div className="actions">
                  <button onClick={() => toggleComplete(task.id)}>
                    {task.completed ? "Undo" : "✔"}
                  </button>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}

      
        <div className="counter">
          Completed: {completedCount} | Uncompleted: {uncompletedCount}
        </div>
      </div>
    </div>
  );
}
