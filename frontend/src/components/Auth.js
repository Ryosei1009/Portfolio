import React, { useState } from 'react'

const Auth = () => {
    const [password, setPassword] = useState('')
    const handleSubmit = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/auth/create`, {
                method: 'POST',
                headers: {
                    'password': password
                }
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        }
    }
    return (
        <div className="pt-16">
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={() => handleSubmit()}>Submit</button>
        </div>
    )
}

export default Auth