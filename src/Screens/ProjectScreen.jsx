import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProjectScreen.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import AddMember from '../components/AddMember';

const ProjectScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState('');
    const [token, setToken] = useState('');
    
    // Hold project in state to reactively render updates (like newly added members)
    const [currentProject, setCurrentProject] = useState(location.state?.project);

    const handleBack = () => {
        navigate('/dashboard');
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

    useEffect(() => {
        const localtoken = localStorage.getItem('token')
        if (localtoken) {
            try {
                setToken(localtoken)
                const decoded = jwtDecode(localtoken)
                setUser(decoded)
            } catch (error) {
                console.error(error)
                localStorage.removeItem('token')
            }
        }
    },[])

    return (
        <div className="project-screen-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button className="btn-back" onClick={handleBack}>
                    ← Back to Dashboard
                </button>
                
                {/* Reusable Add Member Component */}
                <AddMember 
                    projectId={currentProject._id} 
                    ownerId={currentProject.owner?._id || currentProject.owner} 
                    members={currentProject.members} 
                    onMemberAdded={(updatedProject) => setCurrentProject(updatedProject)} 
                />
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