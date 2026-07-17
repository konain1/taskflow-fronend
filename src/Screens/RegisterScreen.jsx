import InputField from "../components/InputField";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [password,setPassword] = useState('')
    const navigate = useNavigate();


   
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/register", {
                name,
                email,
                password,
                role
            });
            console.log("Registration successful:", response.data);
            
            // Save token to localStorage
            if (response.data?.data?.token) {
                localStorage.setItem('token', response.data.data.token);
            } else if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
            }
            
            alert("Registration successful!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Registration failed!");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="container">
                <InputField
                    name="email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                />
            </div>
            <div>
                <InputField
                    name='name'
                    type='text'
                    value={name}
                    onChange={setName}
                />
            </div>
            <div>
                <InputField
                    name='role'
                    type='text'
                    value={role}
                    onChange={setRole}
                />
            </div>
            <div>
                <InputField
                    name='password'
                    type='password'
                    value={password}
                    onChange={setPassword}
                />
            </div>
            <div>
                <button type="submit" className="btn-submit">submit</button>
            </div>
        </form>
    );
};

export default RegisterScreen