import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import AdminDashboard from '../components/AdminDashboard'
import MemberDashboard from '../components/MemberDashboard'

const DashboardScreen = () => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // 1. Fetch token using correct string key 'token'
        const localToken = localStorage.getItem('token');
        
        if (localToken) {
            setToken(localToken);
            try {
                // 2. Decode the JWT token to read payload fields (like email, role)
                const decoded = jwtDecode(localToken);
            
                setUser(decoded);
                console.log("Decoded user:", decoded);
            } catch (err) {
                console.error("Error decoding token:", err);
                localStorage.removeItem('token'); 
            }
        }
    }, []);

    if (!token) {
        return <div style={{ padding: "20px" }}>No token found. Please log in.</div>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Dashboard</h2>
            {user ? (
                user.role === 'member' ? <MemberDashboard /> : <AdminDashboard />
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

export default DashboardScreen;