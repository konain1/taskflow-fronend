import React from 'react';
import './GetProjects.css';
import { useNavigate } from 'react-router-dom';


const GetProjects = ({ data }) => {

    const navigate = useNavigate()


    if (!data || data.length === 0) {
        return (
            <div className="no-projects">
                <p>No projects found. Tap "projects" to fetch or create a new one!</p>
            </div>
        );
    }

    const handleProject = (item) => {
        navigate('/projectScreen', { state: { project: item } });
    };

    return (
        <div className="projects-grid">
            {data.map((item, index) => (
                <div onClick={()=>handleProject(item)} className="project-card" key={item._id || index}>
                    <div className="project-header">
                        <h4 className="project-title">{item.title}</h4>
                        {item.status && (
                            <span className="project-status">{item.status}</span>
                        )}
                    </div>
                    {item.description ? (
                        <p className="project-desc">{item.description}</p>
                    ) : (
                        <p className="project-desc">No description available for this project.</p>
                    )}
                    <div className="project-footer">
                        <span>Created: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GetProjects;