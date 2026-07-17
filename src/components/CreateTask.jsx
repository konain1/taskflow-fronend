import React, { useState } from 'react';
import axios from 'axios';
import './CreateTask.css';

const CreateTask = ({ project, onTaskCreated, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('todo');
    const [priority, setPriority] = useState('medium');
    const [assigneeId, setAssigneeId] = useState('');

    // Compile list of possible assignees (owner + members)
    const assignees = [];
    if (project?.owner) {
        assignees.push(project.owner);
    }
    if (project?.members) {
        project.members.forEach(member => {
            const memberId = member._id || member;
            const alreadyAdded = assignees.some(a => (a._id || a) === memberId);
            if (!alreadyAdded) {
                assignees.push(member);
            }
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const localtoken = localStorage.getItem('token');

        if (!title.trim()) {
            alert("Task title is required!");
            return;
        }

        const taskPayload = {
            title,
            description,
            status,
            priority,
            project: project._id,
        };

        if (assigneeId) {
            taskPayload.assignee = assigneeId;
        }

        try {
            const response = await axios.post(
                "https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/tasks",
                taskPayload,
                {
                    headers: {
                        Authorization: `Bearer ${localtoken}`
                    }
                }
            );

            console.log("Task created successfully:", response.data);
            alert("Task created successfully!");
            
            // Trigger callback if provided to refresh parent's tasks view
            if (onTaskCreated && response.data?.data) {
                onTaskCreated(response.data.data);
            }

            // Reset form fields
            setTitle('');
            setDescription('');
            setStatus('todo');
            setPriority('medium');
            setAssigneeId('');
        } catch (error) {
            console.error("Failed to create task:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to create task");
        }
    };

    return (
        <div className="create-task-panel">
            <h4 className="create-task-title">Create New Task</h4>
            <form onSubmit={handleSubmit} className="create-task-form">
                <div className="form-group">
                    <label>Task Title</label>
                    <input 
                        type="text" 
                        className="task-input"
                        placeholder="Enter task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea 
                        className="task-input"
                        placeholder="Enter task description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        style={{ resize: "vertical" }}
                    />
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Status</label>
                        <select 
                            className="task-input task-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Priority</label>
                        <select 
                            className="task-input task-select"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Assignee</label>
                        <select 
                            className="task-input task-select"
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                        >
                            <option value="">Unassigned</option>
                            {assignees.map(user => {
                                const id = user._id || user;
                                const name = user.name || user.email || `User (${id})`;
                                return (
                                    <option key={id} value={id}>
                                        {name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                <div className="create-task-actions">
                    {onCancel && (
                        <button type="button" className="btn-back" style={{ margin: 0 }} onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="btn-back" style={{ margin: 0, background: "linear-gradient(135deg, #6366f1, #a78bfa)", color: "#fff", borderColor: "transparent" }}>
                        Create Task
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTask;
