import React, { useState } from 'react';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful!');
        setError('');
      } else {
        // Check if data has an error property
        setError(data?.error || 'Unknown error occurred');
      }
    } catch (err) {
      // Check if the error is related to fetch itself
      if (err instanceof Error) {
        setError('Network error: ' + err.message);
      } else {
        setError('Registration failed, please try again');
      }
    }
  };

  return (
    <div style={{ marginTop: "15px", border: "3px solid #4B0082", paddingBottom: "16px", borderRadius: "18px", marginLeft: "250px", fontFamily: "Times New Roman",textAlign: "center"}}>
      <h2>Register</h2>
      <h2>If you are the new user please register the system</h2>
      <form onSubmit={handleRegister}>
        <div style={{paddingBottom:"13px", letterSpacing:"2px", fontWeight: "bold"}}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{paddingBottom:"13px",letterSpacing:"2px", fontWeight: "bold"}}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: "5px", padding: "10px", borderRadius: "18px",border: "3px solid rgb(150, 43, 90)",  fontFamily: "Times New Roman", textAlign: "center"}}>Register</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}

export default Register;
