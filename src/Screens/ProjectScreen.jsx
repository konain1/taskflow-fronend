import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProjectScreen.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';


const ProjectScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState('');
    const [token, setToken] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [showAddMember, setShowAddMember] = useState(false);
    
    // Hold project in state to reactively render updates (like newly added members)
    const [currentProject, setCurrentProject] = useState(location.state?.project);

    const handleBack = () => {
        navigate('/dashboard');
    };

    const getAllUsers = async (localtoken) => {
        const tokenToUse = localtoken || localStorage.getItem('token');
        if (!tokenToUse) return;

        try {
            const response = await axios.get('https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/users', {
                headers: {
                    Authorization: `Bearer ${tokenToUse}`
                }
            });
            if (response.data?.data) {
                setAllUsers(response.data.data);
            }
        } catch (error) {
            console.error('cant fetch all users ', error);
        }
    };

    if (!currentProject) {
        return (
            <div className="project-screen-container">
                <button className="btn-back" onClick={handleBack}>
                    ← Back to Dashboard
                </button>
                <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>
                    <h3>No project selected</h3>
                    <p style={{ marginTop: "8px" }}>Please go back and select a project from your dashboard.</p>
                </div>
            </div>
        );
    }

    // Get initials for avatar circles
    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const handleAddMemberSubmit = async () => {
        const localtoken = localStorage.getItem('token');
        if (!selectedUserId) {
            alert("Please select a user first!");
            return;
        }

        try {
            const response = await axios.post(
                `https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/project/${currentProject._id}/add-member`,
                { memberId: selectedUserId },
                {
                    headers: {
                         Authorization: `Bearer ${localtoken}`
                    }
                }
            );

            console.log("Member added successfully:", response.data);
            alert("Member added successfully!");

            // Update local project details
            if (response.data?.data) {
                setCurrentProject(response.data.data);
            }
            setSelectedUserId('');
            setShowAddMember(false);
        } catch (error) {
            console.error('unable to add member', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Unable to add member');
        }
    };

    useEffect(() => {
        const localtoken = localStorage.getItem('token')
        if (localtoken) {
            try {
                setToken(localtoken)
                const decoded = jwtDecode(localtoken)
                setUser(decoded)
                getAllUsers(localtoken); // Load users on mount
            } catch (error) {
                console.error(error)
                localStorage.removeItem('token')
            }
        }
    },[])

    // Filter out users who are already owner or members
    const nonMembers = allUsers.filter(u => 
        u._id !== currentProject.owner?._id && 
        u._id !== currentProject.owner && // cover case where owner is id string
        !currentProject.members?.some(member => member._id === u._id)
    );

    return (
        <div className="project-screen-container">
            <div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-back" onClick={handleBack}>
                        ← Back to Dashboard
                    </button>
                    <button className="btn-back" onClick={() => setShowAddMember(!showAddMember)}>
                        {showAddMember ? 'Cancel' : '+ Add new Member'}
                    </button>
                </div>

                {showAddMember && (
                    <div className="add-member-panel">
                        <select 
                            className="add-member-select"
                            value={selectedUserId} 
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">Select a user...</option>
                            {nonMembers.map(u => (
                                <option key={u._id} value={u._id}>
                                    {u.name || u.email} ({u.email})
                                </option>
                            ))}
                        </select>
                        <button className="btn-back" style={{ margin: 0 }} onClick={handleAddMemberSubmit}>
                            Add
                        </button>
                    </div>
                )}
            </div>
          

            <div className="project-detail-header">
                <h2 className="project-detail-title">{currentProject.title}</h2>
                <div className="project-meta-info">
                    <span><strong>Created:</strong> {currentProject.createdAt ? new Date(currentProject.createdAt).toLocaleDateString() : 'Just now'}</span>
                </div>
            </div>

            <div className="project-detail-desc">
                <h4 className="project-section-title">Description</h4>
                <p>{currentProject.description || "No description available for this project."}</p>
            </div>

            {currentProject.owner && (
                <div>
                    <h4 className="project-section-title">Owner</h4>
                    <div className="user-card">
                        <div className="user-avatar">
                            {getInitials(currentProject.owner.name || currentProject.owner.email)}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{currentProject.owner.name || "Owner"}</span>
                            <span className="user-email">{currentProject.owner.email}</span>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h4 className="project-section-title">Members</h4>
                {currentProject.members && currentProject.members.length > 0 ? (
                    <div className="members-list">
                        {currentProject.members.map((member, index) => (
                            <div className="user-card" key={member._id || index}>
                                <div className="user-avatar" style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}>
                                    {getInitials(member.name || member.email)}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{member.name || "Member"}</span>
                                    <span className="user-email">{member.email}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: "#64748b", fontSize: "0.9rem" }}>No other members in this project.</p>
                )}
            </div>
        </div>
    );
};

export default ProjectScreen;