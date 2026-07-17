import { useState } from "react"
import InputField from "../components/InputField"
import axios from "axios"


const LoginScreen = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/login", {
                email,password
            })
            console.log("login successful:", response.data);
            alert("loginsuccessful!");
            
        } catch (error) {
            console.error(error)
            alert( error.response?.data?.message || 'Login Failed' )
        }
    }
    
    return (
        <>
            <div>

                <form onSubmit={handleSubmit}> 
                    <div>
                        <InputField
                            name='email'
                            type='email'
                            value={email}
                            onChange={setEmail}


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
                        <button type="submit">Login</button>
                    </div>
                </form>

            </div>
        </>
    )
}

export default LoginScreen